// 'use strict';

(function controller () {
	var addTodoInput = $('.add-todo-input')[0];
	var addTodoBtn = $('.add-todo-btn')[0];
	var addTodoDate = $('.add-todo-date');
	var todoList = $('.todo-list')[0];
	var doneList = $('.todo-list')[1];

	var now = new Date();

	addTodoDate[0].value = now.getMonth() + 1;
	addTodoDate[1].value = now.getDate();
	addTodoDate[2].value = now.getHours();
	addTodoDate[3].value = now.getMinutes();


	for (var i = 0; i < addTodoDate.length; i++) {
		addTodoDate[i].onkeydown = addTodoOnEnter;
	}

	addTodoBtn.onclick = addTodoFromApp;
	addTodoInput.onkeydown = addTodoOnEnter;


	var fireBaseRoot = 'https://incandescent-inferno-8607.firebaseio.com';

	var fireBaseTodo = new Firebase(fireBaseRoot + "/todo");
	var fireBaseDone = new Firebase(fireBaseRoot + "/done");


	function readTodos (snapshot) {
		todoList.innerHTML = '';

		var todos = snapshot.val();

		for (var i in todos) {
			var todo = todos[i];
			console.log( parseInt(todo.dueDate) );
			addTodo(todo.name, parseInt(todo.dueDate), i);
		}
	}

	fireBaseTodo.on("value", readTodos, function (err) {console.log("The read failed: " + err.code);});

	function readDones (snapshot) {
		doneList.innerHTML = '';

		var dones = snapshot.val();
		for (var i in dones) {
			var todo = dones[i];
			console.log( parseInt(todo.dueDate) );
			addDone(todo.name, parseInt(todo.dueDate), i);
		}
	}

	fireBaseDone.on("value", readDones, function (err) {console.log("The read failed: " + err.code);});

	function addTodoOnEnter (key) {
		if (key.keyCode === 13)
			addTodoFromApp();
	};

	function addTodoFromApp () {
		var value = addTodoInput.value;
		console.log(value);
		if (value === "") return;

		var dueDate = new Date(2015, addTodoDate[0].value - 1, addTodoDate[1].value, addTodoDate[2].value, addTodoDate[3].value);
		dueDate = Date.parse(dueDate);

		addTodoFirebase(value, dueDate);
	}

	function addTodo (value, dueDate, firebaseId) {
		return addTask(value, dueDate, firebaseId, todoList, createTodo);
	}

	function addDone (value, dueDate, firebaseId) {
		return addTask(value, dueDate, firebaseId, doneList, createDone);
	}

	function addTask (value, dueDate, firebaseId, list, createFn) {
		// new Date(year, month[, day[, hour[, minutes[, seconds[, milliseconds]]]]]);
		var dif = dueDate - Date.now();
	
		var hrs = parseInt((dif / 3600000 % 24), 10);
		var days = parseInt((dif / 86400000), 10);
		console.log(days, hrs);

		var div = createFn(value, days, hrs, dueDate);
		div.setAttribute('data-firebase', firebaseId);
		list.appendChild(div);

		sortTodos(list);

		return div;
	}

	function addTodoFirebase (name, dueDate) {
		var newRef = fireBaseTodo.push({
			name: name,
			dueDate: dueDate
		});

		return newRef.key();
	}

	function addDoneFirebase (name, dueDate) {
		var newRef = fireBaseDone.push({
			name: name,
			dueDate: dueDate
		})

		return newRef.key();
	}

	function sortTodos (list) {
		var todos = Array.prototype.slice.call( list.children );
		todos = todos.sort(function(a, b) {
			a = a.getAttribute('data-due-date');
			b = b.getAttribute('data-due-date');

			return a - b;
		});

		list.innerHTML = '';

		todos.forEach(function(todo) {
			list.appendChild(todo);	
		});
	}


	function createTodo (name, d, h, due) {
		return createTask(name, d, h, due, deleteTodo, markDone);
	}

	function createDone (name, d, h, due) {
		return createTask(name, d, h, due, deleteDone, markUndone);
	}

	function createTask (name, d, h, due, deleteTask, markFn) {
		d = padTime(d);
		h = padTime(h);

		var todo = createElement('div', 'todo');
		todo.setAttribute('data-due-date', due);

		var todoName = createElement('span', 'todo-name', name);

		var dueDate = createElement('div', 'due-date');
		var days = createElement('div', 'days', d);
		var hrs = createElement('div', 'hrs', h);
	
		var deleteBtn = createElement('div', 'delete-todo', 'X');
		deleteBtn.onclick = deleteTask;
		
		dueDate.appendChild(days);
		dueDate.appendChild(hrs);
		todo.appendChild(todoName);
		todo.appendChild(dueDate);
		todo.appendChild(deleteBtn);
		todo.onclick = markFn;
		return todo;
	}

	function deleteTodo () {
		deleteTask(this.parentNode, 'todo');
	}

	function deleteDone () {
		deleteTask(this.parentNode, 'done');
	}

	function deleteTask (el, list) {
		el.parentNode.removeChild(el);
		var firebaseId = el.getAttribute('data-firebase');

		console.log('firebaseId', firebaseId);

		var ref = new Firebase(fireBaseRoot + "/" + list + "/" + firebaseId);
		
		ref.remove(function(err) {if(err) alert(err);});
	}

	function markDone () {
		markTask(this, 'todo', addDoneFirebase);
	}

	function markUndone () {
		markTask(this, 'done', addTodoFirebase);
	}

	function markTask (thisArg, list, addFn) {
		if (!thisArg.parentNode) return;

		var dueDate = thisArg.getAttribute('data-due-date');

		var children = thisArg.children;
		var name;
		for (var i = 0; i < children.length; i ++) {
			console.log(children[i].className);

			if (children[i].className === 'todo-name')
				name = children[i].innerHTML;
		}
		
		deleteTask(thisArg, list);
		addFn(name, dueDate);
	}

	function padTime (time) {
		if (time < 0) time = 0;
		time = time.toString();
		if (time.length < 2)
			time = '0' + time;
		return time;
	}	
})();