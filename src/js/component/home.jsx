import React, { useState, useEffect } from "react";

/**
 * Function to retrieve or set username from/in local storage.
 *
 * @param {boolean} forceChange - If true, the function will always prompt for a new username.
 * @returns {string} The username.
 */
const getUserName = (forceChange) => {
  
    let user = localStorage.getItem('username');

 
    if(!user || forceChange) {
        do {
            user = prompt("Please enter your ToDo list API id", "");
        } while(user.length === 0);

        localStorage.setItem('username', user);
    }

    return user;
};

/**
 * Un componente que controla la lista de tareas pendientes de un usuario.
 */
const Home = () => {
    const [inputValue, setInputValue] = useState("");
    const [list, setList] = useState([]);
    const [username, setUsername] = useState(getUserName(false));

    /**
     * Función para crear una nueva lista de tareas pendientes para un usuario en el servidor.
     */
    const postData = () => {
        const newList = [{ label: "Empty", done: false }];

        fetch('https://assets.breatheco.de/apis/fake/todos/user/'+username, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newList)
        })
        .then(resp => resp.json())
        .then(() => {
            setList(newList);
        })
        .catch(error => console.log(error)); 
    };

    /**
     * Función para eliminar todos los elementos de tareas pendientes de un usuario en el servidor.
     */
    const deleteData = () => {
        fetch('https://assets.breatheco.de/apis/fake/todos/user/'+username, {
            method: "DELETE",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(resp => resp.json())
        .then(data => {
            if (data.result === 'ok') {
                postData();
            }
        })
        .catch(error => console.log(error));
    };


    useEffect(() => {
        fetch('https://assets.breatheco.de/apis/fake/todos/user/'+username, {
            method: "GET",
            headers: {
                "Content-Type": "application/json"
            }
        })
        .then(resp => resp.json())
        .then(data => {
            if (!data.length) {
                postData();
            } else {
                setList(data);
            }
        })
        .catch(error => console.log(error));
    }, [username]);

 
    useEffect(() => {
        if (list.length > 1) {
            fetch('https://assets.breatheco.de/apis/fake/todos/user/'+username, {
                method: "PUT",
                body: JSON.stringify(list),
                headers: {
                    "Content-Type": "application/json"
                }
            })
            .then(resp => resp.json())
            .then(data => console.log(data))
            .catch(error => console.log(error));
        }
    }, [list]);

    const handleKeyDown = (event) => {
        if (event.key === "Enter") {
            setList([...list, { label: inputValue, done: false }]);
            setInputValue("");
        }
    };

    const handleDelete = (index) => {
        let newList = [...list];
        newList.splice(index, 1);
        setList(newList);
    };

    return (
        <div className="text-center">
            <h1>Todo list for: {username}</h1>
            <hr />
            <div>
                <input
                    type="text"
                    placeholder="Add tasks here"
                    value={inputValue}
                    onChange={(event) => setInputValue(event.target.value)}
                    onKeyDown={handleKeyDown}
                />
                <button onClick={deleteData}>Borrar todo</button>
                <button onClick={() => setUsername(getUserName(true))}>Cambiar de usuario</button>
            </div>
            {
                list.length <= 1 ? 
                (<p>No hay tareas, añade una</p>) :
                (
                    <div>
                        {
                            list.map((item, index) => {
                                if (index >= 1) {
                                    return (
                                        <div key={index} style={{ padding: '5px' }}>
                                            <span>{item.label}</span>
                                            <button onClick={() => handleDelete(index)}>Borrar</button>
                                        </div>
                                    )
                                }
                            })
                        }
                    </div>
                )
            }
        </div>
    );
}

export default Home;