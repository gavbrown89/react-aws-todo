import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import 'bootstrap/dist/css/bootstrap.min.css';
import Amplify, {API,graphqlOperation} from 'aws-amplify';
import { withAuthenticator } from 'aws-amplify-react';
import aws_exports from './aws-exports';
Amplify.configure(aws_exports);

const createTodo = `mutation createTodo($note: String!) {
  createTodo(input: {
    todo: $todo
  }) {
    __typename
    id
    todo
  }
}`;

const readTodo = `query listTodo {
  listTodo {
    items {
      __typename
      id
      todo
    }
  }
}`;

const updateTodo = `mutation updateTodo($id: ID!, $todo: String) {
  updateTodo(input: {
    id: $id
    todo: $todo
  }) {
    __typename
    id
    todo
  }
}`;

const deleteTodo = `mutation deleteTodo($id: ID!) {
  deleteTodo(input: {
    id: $id
  }) {
    __typename
    id
    todo
  }
}`;

export const App = () => {
  const [id, setId] = useState('');
  const [todo, setTodo] = useState([]);
  const [value, setValue] = useState('');
  const [addBtn, setAddBtn] = useState(true);
  const [updateBtn, setUpdateBtn] = useState(false);

  useEffect(async () => {
    const todo = await API.graphql(graphqlOperation(readTodo));
    setTodo(todo.data.listTodo.items);
  });

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const todo = {"todo": todo};
    await API.graphql(graphqlOperation(createTodo, todo));
    listTodo();
    setValue('');
  };

  const handleDelete = async (id) => {
    const todoId = {"id": id};
    await API.graphqlOperation(deleteTodo, todoId);
    listTodo();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const todo = {
      "id": id,
      "todo": value
    };
    await API.graphql(graphqlOperation(updateTodo, todo));
    listTodo();
    setAddBtn(true);
    setUpdateBtn(false);
    setValue('');
  };

  const selectTodo = (todo) => {
    setId(todo.id);
    setValue(todo.todo);
    setAddBtn(false);
    setUpdateBtn(true);
  };

  const listTodo = async () => {
    const todo = await API.graphql(graphqlOperation(readTodo));
    setTodo(todo.data.listTodo.items);
  };

  const data = [].concat(todo).map((item, i) =>
    <div className="alert alert-primary alert-dismissible show" role="alert">
      <span key={item.i} onClick={selectTodo(this, item)}>{item.note}</span>
      <button key={item.i} type="button" className="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );

  return (
    <div className="App">
      <header className="App-header" alt="logo">
        <img src={logo} className="App-logo" alt="logo" />
        <h1 className="App-title">Todo App</h1>
      </header>
      <div className="container">
        {addBtn ?
          <form onSubmit={handleSubmit}>
            <div className="input-group mb-3">
              <input type="text" className="form-control form-control-lg" placeholder="new todo" />
              <div className="input-group-append">
                <button className="btn btn-primary" type="submit">
                  Add todo
                </button>
              </div>
            </div>
          </form>
        : null}
      </div>
      <div className="container">
        {data}
      </div>
    </div>
  );
}

export default withAuthenticator(App, { includeGreetings: true });