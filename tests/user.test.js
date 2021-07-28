const request = require('supertest');
const app = require('../src/app');
const { userOne, userOneId, setupDatabase } = require('./fixtures/db');
const User = require('../src/models/user');

beforeEach(async () => {
	await setupDatabase();
});

test('Should signup a new user', async () => {
	const response = await request(app)
		.post('/users')
		.send({
			name: 'nayan',
			email: 'nayan123@gmail.com',
			password: '12343566'
		})
		.expect(201);

	// assert that the database has changed correctly
	const user = await User.findById(response.body.user._id);
	expect(user).not.toBeNull();

	//assertions about the response
	expect(response.body).toMatchObject({
		user: {
			name: 'nayan',
			email: 'nayan123@gmail.com'
		},
		token: user.tokens[0].token
	});
	expect(user.password).not.toBe('12343566');
});

test('Should login existing user', async () => {
	const response = await request(app)
		.post('/users/login')
		.send({
			email: userOne.email,
			password: userOne.password
		})
		.expect(200);

	const user = await User.findById(response.body.user._id);
	expect(response.body.token).toBe(user.tokens[1].token);
});

test('Should not login non-existing user', async () => {
	await request(app)
		.post('/users/login')
		.send({
			email: 'nayan123@gmail.om',
			password: '1234356'
		})
		.expect(400);
});

test('Should get profile of authenticated user', async () => {
	await request(app)
		.get('/users/me')
		.set('Authorization', 'Bearer ' + userOne.tokens[0].token)
		.send()
		.expect(200);
});

test('Should not get profile of unauthenticated user', async () => {
	await request(app).get('/users/me').send().expect(401);
});

test('Should delete account for user', async () => {
	await request(app)
		.delete('/users/me')
		.set('Authorization', 'Bearer ' + userOne.tokens[0].token)
		.send()
		.expect(200);

	const user = await User.findById(userOneId);
	expect(user).toBeNull();
});

test('Should not delete account for unauthenticated user', async () => {
	await request(app).delete('/users/me').send().expect(401);
});

test('Should upload avatar image', async () => {
	await request(app)
		.post('/users/me/avatar')
		.set('Authorization', 'Bearer ' + userOne.tokens[0].token)
		.attach('avatar', 'tests/fixtures/profile-pic.jpg')
		.expect(200);

	const user = await User.findById(userOneId);
	expect(user.avatar).toEqual(expect.any(Buffer));
});

test('Should update user profile', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', 'Bearer ' + userOne.tokens[0].token)
		.send({
			name: 'Jess'
		})
		.expect(200);

	const user = await User.findById(userOneId);
	expect(user.name).toBe('Jess');
});

test('Should not update invalid user fields', async () => {
	await request(app)
		.patch('/users/me')
		.set('Authorization', 'Bearer ' + userOne.tokens[0].token)
		.send({
			location: 'Bhopal'
		})
		.expect(400);
});
