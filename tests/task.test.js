const request = require('supertest');
const app = require('../src/app');
const User = require('../src/models/user');
const Task = require('../src/models/task');
const {
	userOne,
	userTwo,
	taskOne,
	taskTwo,
	taskThree,
	userTwoId,
	userOneId,
	setupDatabase
} = require('./fixtures/db');

beforeEach(async () => {
	await setupDatabase();
});

test('Should create task for user', async () => {
	const response = await request(app)
		.post('/tasks/')
		.set('Authorization', 'Bearer ' + userOne.tokens[0].token)
		.send({
			description: 'hello'
		})
		.expect(201);

	const task = await Task.findById(response.body._id);
	expect(task).not.toBeNull();
	expect(task.completed).toEqual(false);
});

test('Should return all tasks for user one', async () => {
	const response = await request(app)
		.get('/tasks/')
		.set('Authorization', 'Bearer ' + userOne.tokens[0].token)
		.send({
			description: 'hello'
		})
		.expect(200);

	expect(response.body.length).toBe(2);
	//expect(task.completed).toEqual(false);
});

test('Should not delete others users task', async () => {
	const response = await request(app)
		.delete(`/tasks/${taskOne._id}`)
		.set('Authorization', 'Bearer ' + userTwo.tokens[0].token)
		.send()
		.expect(404);

	const task = await Task.findById(taskOne._id);
	expect(task).not.toBeNull();
	//expect(task.completed).toEqual(false);
});
