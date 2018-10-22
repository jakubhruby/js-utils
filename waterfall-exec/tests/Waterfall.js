import test from 'ava';
import waterfallExec from 'waterfall-exec';

const
	{Waterfall} = waterfallExec;

test('One job', async t => {
	let
		results = [],
		waterfall = new Waterfall(),
		jobs = createPromiseJobs(1, results);

	await waterfall.exec(jobs);

	t.true(results.length === 1 && results.every(result => result === true));
});

test('Multiple jobs', async t => {

	let
		results = [],
		waterfall = new Waterfall(),
		jobs = createPromiseJobs(3, results);

	await waterfall.exec(jobs);

	t.true(results.length === 3 && results.every(result => result === true));
});

test('Mixed data and Promises', async t => {

	let
		results = [],
		waterfall = new Waterfall(),
		promiseJobs = createPromiseJobs(3, results),
		dataJobs = createDataJobs(3, results),
		jobs = promiseJobs.concat(dataJobs);

	await waterfall.exec(jobs);

	t.true(results.length === 6 && results.every(result => result === true));
});

test('Wait for new jobs with no timeout', async t => {

	let
		addJobTicker,
		results = [],
		waterfall = new Waterfall(),
		jobs = createPromiseJobs(3, results),
		addJobs = createPromiseJobs(5, results);

	addJobTicker = setInterval(function() {
		if (addJobs.length) {
			let
				addJob = addJobs.shift();

			jobs.push(addJob);
		}
		else if (!waterfall.jobs.length) {
			waterfall.stop();
			clearInterval(addJobTicker);
		}
	}, 3000);

	await waterfall.exec(jobs, {
		waitForItems: true
	});

	t.true(results.length === 8 && results.every(result => result === true));
});

test('Wait for new jobs with timeout 5 s', async t => {

	let
		addJobTicker,
		results = [],
		waterfall = new Waterfall(),
		jobs = createPromiseJobs(1, results),
		addJobs = createPromiseJobs(2, results);

	addJobTicker = setInterval(function() {
		if (addJobs.length) {
			let
				addJob = addJobs.shift();

			jobs.push(addJob);
		}
		else if (!waterfall.jobs.length) {
			waterfall.stop();
			clearInterval(addJobTicker);
		}
	}, 3000);

	await waterfall.exec(jobs, {
		waitForItems: true,
		waitTimeout: 5000
	});

	t.true(results.length === 3 && results.every(result => result === true));
});

function createPromiseJobs(count, results) {
	let
		jobs = [];

	for (let i = 0; i < count; i++) {
		jobs.push(() => {
			return new Promise(function(resolve) {
				setTimeout(function() {
					results.push(true);
					resolve();
				}, 500);
			});
		});
	}

	return jobs;
}

function createDataJobs(count, results) {
	let
		jobs = [];

	for (let i = 0; i < count; i++) {
		jobs.push(() => {
			results.push(true);
			return {
				data: 'data'
			};
		});
	}

	return jobs;
}
