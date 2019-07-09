import React, { useReducer, useEffect } from "react";
import api from "./services/api";
import { Formik } from "formik";
import { FaTrash } from "react-icons/fa";
import "./App.scss";

const initialState = {
  notesList: []
};

const reducer = (state, action) => {
  let { notesList } = state;

  switch (action.type) {
    case "refresh":
      notesList = [...action.payload];
      break;
    case "add":
      notesList = [...notesList, action.payload];
      break;
    case "remove":
      notesList = notesList.filter(note => note._id !== action.payload._id);
      break;
  }

  return { notesList };
};

const App = () => {
  const [state, dispatch] = useReducer(reducer, initialState);

  const getAllNotes = async () => {
    try {
      const response = await api.request({ url: "/note" });

      dispatch({ type: "refresh", payload: response.data });
    } catch (error) {
      console.error("Error fetching notes", error);
    }
  };

  const removeNote = async id => {
    try {
      const response = await api.request({
        url: `/note/${id}`,
        method: "delete"
      });

      dispatch({ type: "remove", payload: response.data });
    } catch (error) {
      console.error("Error deleting note", error);
    }
  };

  useEffect(() => {
    getAllNotes();
  }, []);

  return (
    <div>
      <main>
        <h1>Notes App</h1>

        {state.notesList.map(note => (
          <div key={note._id} className="note">
            <div className="container">
              <h2>{note.title}</h2>
              <p>{note.content}</p>
            </div>

            <button onClick={() => removeNote(note._id)}>
              <FaTrash />
            </button>
          </div>
        ))}
      </main>

      <hr />

      <footer>
        <Formik
          initialValues={{ title: "", content: "" }}
          validate={values => {
            let errors = {};

            if (!values.title) {
              errors.title = "Title is required";
            }

            if (!values.content) {
              errors.content = "Content is required";
            }

            return errors;
          }}
          onSubmit={async (values, { setSubmitting, resetForm }) => {
            try {
              const response = await api.request({
                url: "/note",
                method: "post",
                data: {
                  title: values.title,
                  content: values.content
                }
              });

              dispatch({ type: "add", payload: response.data });
              resetForm();
            } catch (error) {
              console.error("Error creating note", error);
            } finally {
              setSubmitting(false);
            }
          }}
        >
          {({
            values,
            errors,
            touched,
            handleChange,
            handleBlur,
            handleSubmit,
            isSubmitting
          }) => (
            <form onSubmit={handleSubmit}>
              <label for="title">Title</label>
              <input
                type="text"
                name="title"
                id="title"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.title}
              />
              {errors.title && touched.title && errors.title}

              <br />

              <label for="content">Content</label>
              <textarea
                rows={5}
                name="content"
                id="content"
                onChange={handleChange}
                onBlur={handleBlur}
                value={values.content}
              />
              {errors.content && touched.content && errors.content}

              <br />

              <button type="submit" disabled={isSubmitting}>
                Create new note
              </button>
            </form>
          )}
        </Formik>
      </footer>
    </div>
  );
};

export default App;
