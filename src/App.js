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
    await API.graphql(graphqlOperation(deleteTodo, todoId));
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
    setAddBtn(true);
    setUpdateBtn(false);
    setValue('');
    listTodos();
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
    <div key={item} onClick={() => {selectTodo(item)}} className="alert alert-primary alert-dismissible show selectable-todo" role="alert">
      <span >{item.todo}</span>
      <button key={i + 1} type="button" onClick={() => {handleDelete(item.id)}} className="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">&times;</span>
      </button>
    </div>
  );

  return (
    authState === AuthState.SignedIn && user ? (
      <div className="App">
        <header className="App-header">
            <div className="col-md-6 text-left header-contents-container">
              <img src={logo} className="App-logo" alt="logo" />
              <h4 className="App-title">Todo App</h4>
            </div>
            <div className="col-md-6 text-right header-contents-container">
              <div className="sign-out-btn">
                <AmplifySignOut />
              </div>
            </div>
        </header>
        <div className="container" style={{ marginTop: -30 }}>
          <Card>
            <Card.Header className="text-left">Create a new todo</Card.Header>
            {addBtn ?
            <Card.Body>
              <Form onSubmit={handleSubmit}>
                <Form.Group className="input-group mb-3">
                  <Form.Control type="text" className="form-control form-control-lg" placeholder="new todo" value={value} onChange={handleChange} />
                  <div className="input-group-append">
                    <Button variant="primary" type="submit">
                        Add todo
                    </Button>
                  </div>
                </Form.Group>
              </Form>
            </Card.Body>
            : null}
            {updateBtn ?
            <Card.Body>
              <Form onSubmit={handleUpdate}>
                <Form.Group className="input-group mb-3">
                  <Form.Control type="text" className="form-control form-control-lg" placeholder="Update todo" value={value} onChange={handleChange} />
                  <div className="input-group-append">
                    <Button className="btn btn-primary" type="submit" >Update todo</Button>
                  </div>
                </Form.Group>
              </Form>
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