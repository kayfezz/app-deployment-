document.getElementById("addtaskBtn").addEventListener("click", addTask);
getTodos();

async function getTodos() {
    try {
        const response = await fetch("http://localhost:3000/todos");
        todos = await response.json();
        renderTasks();
    } catch (error) {
        console.error("Error fetching todo", error);
    }   
}

async function addTask() {
    const input = document.getElementById("taskinput");
    const dueDateInput = document.getElementById("dueDateInput");
    const title = input.value.trim();
    const dueDate = dueDateInput.value;

    
    if (title === "") {
        alert("Please enter a task");
        return;
    }

    try {
        const response = await fetch("http://localhost:3000/todos", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title, dueDate })
        });

        const newTodo = await response.json();
        console.log("New Task has been added.with ID:", newTodo.id);
        todos.push(newTodo);
        input.value = "";
        renderTasks();
    } catch (error) {
        console.error("Error adding tasks", error);
    }
}

async function toggleCompletion(id) {
    const todo = todos.find(t => t.id === id);
    if (!todo) return;

    const newStatus = !todo.isCompleted;

    try {
        const response = await fetch(`http://localhost:3000/todos/${id}`, {
            method: "PATCH", 
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ isCompleted: newStatus })
        });

        if (response.ok) {
            todo.isCompleted = newStatus;
            renderTasks();
        } else {
            console.error("Try Again Did Not Work");
        }
    } catch (error) {
        console.error("Error sending PATCH.", error);
    }
}

async function deleteTask(id, index) {
    try {
        const response = await fetch(`http://localhost:3000/todos/${id}`, {
            method: "DELETE"
        });

        if (response.ok) {
            todos.splice(index, 1);
            renderTasks();
        } else {
            console.error("didn't Update");
        }
    } catch (error) {
        console.error("Error deleting tasks", error);
    }
}

async function updateTodo(id, newTitle, newStatus) {
    try {
        const response = await fetch(`http://localhost:3000/todos/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ title: newTitle, isCompleted: newStatus })
        });

        if (response.ok) {
            const updatedTodo = await response.json();
            const index = todos.findIndex(t => t.id === id);
            if (index !== -1) {
                todos[index] = updatedTodo;
                renderTasks(); 
            }
        } else {
            console.error("Failed");
        }
    } catch (error) {
        console.error("Error sending PUT", error);
    }
}

function renderTasks() {
    const list = document.getElementById("taskList");
    list.innerHTML = "";
  
    todos.forEach((todo, index) => {
      // ADD
      const li = document.createElement("li");
      li.className = "task-item";
  
      // ADD
      const left = document.createElement("div");
      left.className = "task-left";
  
      const checkbox = document.createElement("input");
      checkbox.type = "checkbox";
      checkbox.checked = todo.isCompleted;
      checkbox.addEventListener("change", () => toggleCompletion(todo.id));
  
      const span = document.createElement("span");
      span.textContent = todo.title;
  
      // ADD
      if (todo.isCompleted) {
        span.classList.add("completed");
      }
  
      // ADD
      left.appendChild(checkbox);
      left.appendChild(span);

       // ADD
       const dueDateText = document.createElement("small");
       if (todo.dueDate) {
         dueDateText.textContent = "Due: " + new Date(todo.dueDate).toLocaleDateString();
         dueDateText.className = "due-date";
         left.appendChild(dueDateText);
       }
  
      // ADD
      const actions = document.createElement("div");
      actions.className = "task-actions";
  
      const editBtn = document.createElement("button");
      editBtn.textContent = "✏️";
      editBtn.title = "Edit Task";
      editBtn.addEventListener("click", () => {
        const newTitle = prompt("Edit task title:", todo.title);
        if (newTitle !== null && newTitle.trim() !== "") {
          updateTodo(todo.id, newTitle.trim(), todo.isCompleted);
        }
      });
  
      const deleteBtn = document.createElement("button");
      deleteBtn.textContent = "🗑️";
      deleteBtn.title = "Delete Task";
      deleteBtn.addEventListener("click", () => deleteTask(todo.id, index));
  
      actions.appendChild(editBtn);
      actions.appendChild(deleteBtn);
  
      // ADD
      li.appendChild(left);
      li.appendChild(actions);
      list.appendChild(li);
    });
  }








