import React, { useState, useEffect } from 'react';
import logo from './logo.svg';
import './App.css';
import {
  Card,
  Form,
  Button
} from 'react-bootstrap';
import 'bootstrap/dist/css/bootstrap.min.css';
import Amplify, {API,graphqlOperation} from 'aws-amplify';
import { 
  AmplifyAuthenticator, 
  AmplifySignUp,
  AmplifySignOut 
} from '@aws-amplify/ui-react';
import { 
  AuthState, 
  onAuthUIStateChange 
} from '@aws-amplify/ui-components';

import aws_exports from './aws-exports';
Amplify.configure(aws_exports);

const createTodo = `mutation createTodo($todo: String!) {
  createTodo(input: {
    todo: $todo
  }) {
    __typename
    id
    todo
  }
}`;

const readTodo = `query listTodos {
  listTodos {
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
  const [authState, setAuthState] = useState();
  const [user, setUser] = useState();
  const [id, setId] = useState('');
  const [todo, setTodo] = useState([]);
  const [value, setValue] = useState('');
  const [addBtn, setAddBtn] = useState(true);
  const [updateBtn, setUpdateBtn] = useState(false);

  const authStateChange = () => {
    return onAuthUIStateChange((nextAuthState, authData) => {
      setAuthState(nextAuthState);
      setUser(authData);
    });
  };

  const initializeTodo = async () => { 
    const getTodo = await API.graphql(graphqlOperation(readTodo));
    setTodo(getTodo.data.listTodos.items);
  };

  useEffect(() => {
    authStateChange();
    initializeTodo();
    console.log(todo);
  }, []);

  const handleChange = (e) => {
    setValue(e.target.value);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const todo = {"todo": value};
    await API.graphql(graphqlOperation(createTodo, todo));
    listTodos();
    setValue('');
  };

  const handleDelete = async (id) => {
    const todoId = {"id": id};
    await API.graphqlOperation(deleteTodo, todoId);
    listTodos();
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    const todo = {
      "id": id,
      "todo": value
    };
    await API.graphql(graphqlOperation(updateTodo, todo));
    listTodos();
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

  const listTodos = async () => {
    const todo = await API.graphql(graphqlOperation(readTodo));
    setTodo(todo.data.listTodos.items);
  };

  const data = [].concat(todo).map((item, i) =>
    <div className="alert alert-primary alert-dismissible show" role="alert">
      <span key={item} onClick={() => {selectTodo(item)}}>{item.todo}</span>
      <button key={i + 1} type="button" onClick={() => {handleDelete(item.id)}} className="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );

  return (
    authState === AuthState.SignedIn && user ? (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h2 className="App-title">Todo App</h2>
          <AmplifySignOut />
        </header>
        <div className="container">
          <Card>
            <Card.Header>Create a new todo</Card.Header>
            {addBtn ?
            <Card.Body>
              <form onSubmit={handleSubmit}>
                <div className="input-group mb-3">
                  <input type="text" className="form-control form-control-lg" placeholder="new todo" value={value} onChange={handleChange} />
                  <div className="input-group-append">
                    <button className="btn btn-primary" type="submit">
                      Add todo
                    </button>
                  </div>
                </div>
              </form>
            </Card.Body>
            : null}
            {updateBtn ?
            <Card.Body>
              <form onSubmit={handleUpdate}>
                <div className="input-group mb-3">
                  <input type="text" className="form-control form-control-lg" placeholder="Update todo" value={value} onChange={handleChange} />
                  <div className="input-group-append">
                    <button className="btn btn-primary" type="submit" >Update todo</button>
                  </div>
                </div>
              </form>
            </Card.Body>
            : null}
            <Card.Body>
              {data}
            </Card.Body>
          </Card>
        </div>
      </div>
    ) : (
      <AmplifyAuthenticator>
        <AmplifySignUp 
          slot="sign-up"
          formFields={[
            { type: "username" },
            { type: "email" },
            { type: "password" },
            { type: "phone_number" }
          ]}
        />
      </AmplifyAuthenticator>
    )
  );
}

export default App;