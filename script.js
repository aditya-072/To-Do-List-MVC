/**
 * @class Model
 *
 * Manages the data of the application.
 */
class Model {
    // constructor that will load all todos data from local storage or if their is no data then it will initialize with empty array
    // `todos` is an array and attribute of the class Model
    constructor() {
        this.todos = JSON.parse(localStorage.getItem('todos')) || []
    }
    // bindTodoListChanged is a function of this class (class Model), after updating the todos it will inform the view that todos has been updated their is need to update view.
    // onTodoListChanged is a function of class View that has been passed to this func and onTodoListChanged is also an attribute of the this class bindTodoListChanged assign this passed function to this attribute so that whenever their is change in todos we will call this onTodoListChanged func of View to update the view. class Model does not know anything about the implementation of the onTodoListChanged func of the View class.
    // An object of Model class will get passed to the Controller, so Controller can call this function and pass this onTodoListChanged function.
    bindTodoListChanged(callback) {
        this.onTodoListChanged = callback
    }

    // This func will save changes to the local storage and inform the view class about the updation of the todos by calling the passed onTodoListChanged func of the View class
    _commit(todos) {
        this.onTodoListChanged(todos) // updating the view
        localStorage.setItem('todos', JSON.stringify(todos)) // saving changes to the local storage
    }

    // it will add new todo to the todo list
    addTodo(todoText) {
        const todo = {
            id: this.todos.length > 0 ? this.todos[this.todos.length - 1].id + 1 : 1, // assign id of previous todo + 1 to the new or 1 in case of no previous todo
            text: todoText,
            complete: false,
        }

        this.todos.push(todo) // adding new todo to the todos array

        this._commit(this.todos) // saving changes to the local storage
    }

    // for editing the todo
    editTodo(id, updatedText) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { id: todo.id, text: updatedText, complete: todo.complete } : todo
        )

        this._commit(this.todos)
    }

    // delete todo
    deleteTodo(id) {
        this.todos = this.todos.filter(todo => todo.id !== id) // this will simply filters out all the todos whose id is not equal to the passed id, this way todo with passed id will get deleted. Reassign array with all todos whose id is not equal to the passed array.

        this._commit(this.todos)
    }

    // `todo` is completed or not
    toggleTodo(id) {
        this.todos = this.todos.map(todo =>
            todo.id === id ? { id: todo.id, text: todo.text, complete: !todo.complete } : todo
        )

        this._commit(this.todos)
    }
}

/**
 * @class View
 *
 * Visual representation of the model.
 */
class View {
    constructor() {
        this.app = this.getElement('#root')
        this.form = this.createElement('form') // create an element form
        this.input = this.createElement('input') // create an input element
        this.input.type = 'text'    // define the type to the input element
        this.input.placeholder = 'Add todo'     // adding placeholder to the input element
        this.input.name = 'todo'
        this.submitButton = this.createElement('button')    // creating a submit button
        this.submitButton.textContent = 'Submit'
        this.form.append(this.input, this.submitButton)     // combining the above created input and submit element to the form.
        this.title = this.createElement('h1')
        this.title.textContent = 'Todos'
        this.todoList = this.createElement('ul', 'todo-list')   // creating html element for displaying the todos with tag and className
        this.app.append(this.title, this.form, this.todoList)   // append all

        this._temporaryTodoText = ''
        this._initLocalListeners()  // calling this function to add event listoner to the changing text, this event listoner gets activated on creation of new object of View class
    }

    get _todoText() {
        return this.input.value
    }

    _resetInput() {
        this.input.value = ''
    }

    // creating html element with passed tag and class name
    createElement(tag, className) {
        const element = document.createElement(tag)

        if (className) element.classList.add(className)

        return element
    }

    // returning a html element
    getElement(selector) {
        const element = document.querySelector(selector)

        return element
    }

    // function to display todos to the view
    displayTodos(todos) {
        // Delete all nodes
        // `todoList` is an array of html list element for displaying todos to the view, this list element contain information of the todo, Here, we are removing the previously added html list so that we can add new updated html list
        while (this.todoList.firstChild) {
            this.todoList.removeChild(this.todoList.firstChild)
        }

        // Show default message
        if (todos.length === 0) {
            const p = this.createElement('p')
            p.textContent = 'Nothing to do! Add a task?'
            this.todoList.append(p)
        } else {
            // Create nodes, ad: creating the array of  html list element for displaying todos
            todos.forEach(todo => {
                const li = this.createElement('li')
                li.id = todo.id

                const checkbox = this.createElement('input')
                checkbox.type = 'checkbox'
                checkbox.checked = todo.complete

                const span = this.createElement('span')
                span.contentEditable = true
                span.classList.add('editable')

                if (todo.complete) {
                    const strike = this.createElement('s')  // !! ??
                    strike.textContent = todo.text
                    span.append(strike)
                } else {
                    span.textContent = todo.text
                }

                const deleteButton = this.createElement('button', 'delete')
                deleteButton.textContent = 'Delete'
                li.append(checkbox, span, deleteButton)

                // Append nodes
                this.todoList.append(li)
            })
        }

        // Debugging
        console.log(todos)
    }

    // initialize the event listoner
    _initLocalListeners() {
        // adding the event listener to the input field and assign edited text to the _temporaryTodoText on change
        this.todoList.addEventListener('input', event => {
            if (event.target.className === 'editable') {
                this._temporaryTodoText = event.target.innerText
            }
        })
    }

    // handler is passed by the controller for handling the submit, on submit todo should get added or updated. view is passing the input text to the controller through this handler and controller will then pass this text to the Model for change in local storage. view is not aware of the working of the handler, and Controller will also pass this text to the Model, Controller is also not aware of the storage.
    bindAddTodo(handler) {
        this.form.addEventListener('submit', event => {
            event.preventDefault()

            if (this._todoText) {
                handler(this._todoText)
                this._resetInput()
            }
        })
    }

    // informing the Controller about the delete attempt by the user
    bindDeleteTodo(handler) {
        this.todoList.addEventListener('click', event => {
            if (event.target.className === 'delete') {
                const id = parseInt(event.target.parentElement.id)

                handler(id)
            }
        })
    }


    bindEditTodo(handler) {
        this.todoList.addEventListener('focusout', event => {
            if (this._temporaryTodoText) {
                const id = parseInt(event.target.parentElement.id)

                handler(id, this._temporaryTodoText)
                this._temporaryTodoText = ''
            }
        })
    }

    bindToggleTodo(handler) {
        this.todoList.addEventListener('change', event => {
            if (event.target.type === 'checkbox') {
                const id = parseInt(event.target.parentElement.id)

                handler(id)
            }
        })
    }
}

/**
 * @class Controller
 *
 * Links the user input and the view output.
 *
 * @param model
 * @param view
 */
class Controller {
    // Controller will receive a new Model class object and a new View class object
    constructor(model, view) {
        this.model = model
        this.view = view

        // Explicit this binding
        this.model.bindTodoListChanged(this.onTodoListChanged)
        this.view.bindAddTodo(this.handleAddTodo)
        this.view.bindEditTodo(this.handleEditTodo)
        this.view.bindDeleteTodo(this.handleDeleteTodo)
        this.view.bindToggleTodo(this.handleToggleTodo)

        // Display initial todos
        this.onTodoListChanged(this.model.todos)
    }

    // connecting the View class and Model class, calling the function of View class but parameter todos is passed by the Model class as this  onTodoListChanged function is passed to the Model class above in bindTodoListChanged function.
    onTodoListChanged = todos => {
        this.view.displayTodos(todos)
    }

    handleAddTodo = todoText => {
        this.model.addTodo(todoText)
    }

    handleEditTodo = (id, todoText) => {
        this.model.editTodo(id, todoText)
    }

    handleDeleteTodo = id => {
        this.model.deleteTodo(id)
    }

    handleToggleTodo = id => {
        this.model.toggleTodo(id)
    }
}

const app = new Controller(new Model(), new View())