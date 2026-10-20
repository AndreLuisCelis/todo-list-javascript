
		const listTodos = JSON.parse(localStorage.getItem("todos")) || [];
		const listTodosArchiveds = JSON.parse(localStorage.getItem("archiveds")) || [];
		let viewArchiveds = false;
		const inputNewItem = document.getElementById("new-item");
		const todosContainer = document.getElementById("list-todos");
		let draggedTodo = null;

		const formatTodoDate = (createdAt) => {
			if (!createdAt) {
				return "";
			}

			const date = new Date(createdAt);
			return Number.isNaN(date.getTime()) ? "" : date.toLocaleDateString("pt-BR");
		};

		const renderTodoContent = (todo) => {
			const formattedDate = formatTodoDate(todo.createdAt);
			const dateMarkup = formattedDate
				? `<time class="todo-date" datetime="${todo.createdAt}">${formattedDate}</time>`
				: "";

			return `
				<div class="todo-content">
					${dateMarkup}
					<p id="text-item-${todo.uid}" class="${todo.checked ? "text-line" : ""}">${todo.description}</p>
				</div>
			`;
		};

		inputNewItem.addEventListener('keypress',(e)=> {
			if(e.code ==='Enter'){
				addItem();
			}
		})

		const loadTodos = () => {
			todosContainer.innerHTML = "";
			[...listTodos].reverse().forEach((todo) => {
				if(!todo){
					return;
				}
				todosContainer.insertAdjacentHTML(
					"beforeEnd",
					`
        <div class="card-item-list ${todo.checked ? "bg-success" : "bg-white"}" id="card-item-${todo.uid}" draggable="true">
			<div>
            <input type="checkbox" name="sixth" id="item-${todo.uid}" onchange="inputChecked(event)" 
            ${todo.checked ? "checked" : ""} >
			</div>

            ${renderTodoContent(todo)}
			<div class="dropdown">
                <button onclick="openMenu('myDropdown-${todo.uid}')" class="dropbtn">...</button>
                <div id="myDropdown-${todo.uid}" class="dropdown-content">
                  <a onclick="arquiveItem('card-item-${todo.uid}')">Arquivar</a>
                  <a onclick="editItem('text-item-${todo.uid}')">Editar</a>
                </div>
              </div>
        </div>
    `,
				);
			});
		};

		const loadTodosArchived = () => {
			const listItems = document.getElementById("list-todos-archiveds");
			listItems.innerHTML = "";
			listTodosArchiveds.map((todo) => {
				listItems.insertAdjacentHTML(
					"afterBegin",
					`
        <div class="card-item-list ${todo.checked ? "bg-success" : "bg-white"}" id="card-item-${todo.uid}" >
             ${renderTodoContent(todo)}
            <div class="dropdown">
                <button onclick="openMenu('myDropdown-${todo.uid}')" class="dropbtn">...</button>
                <div id="myDropdown-${todo.uid}" class="dropdown-content">
                  <a onclick="restoreItem('card-item-${todo.uid}')">Restaurar</a>
                  <a onclick="deleteItem('card-item-${todo.uid}')">Deletar</a>
                </div>
              </div>
        </div>
    `,
				);
			});
		};

		const saveTodos = () => {
			localStorage.setItem("todos", JSON.stringify(listTodos));
		};
		const saveArchiveTodos = () => {
			localStorage.setItem("archiveds", JSON.stringify(listTodosArchiveds));
		};

		todosContainer.addEventListener("dragstart", (event) => {
			const todoCard = event.target.closest(".card-item-list[draggable='true']");
			if (!todoCard || event.target.closest("button, input, [contenteditable='true']")) {
				event.preventDefault();
				return;
			}

			draggedTodo = todoCard;
			todoCard.classList.add("dragging");
			event.dataTransfer.effectAllowed = "move";
			event.dataTransfer.setData("text/plain", todoCard.id);
		});

		todosContainer.addEventListener("dragover", (event) => {
			if (!draggedTodo) {
				return;
			}

			event.preventDefault();
			const targetCard = event.target.closest(".card-item-list[draggable='true']");
			if (!targetCard || targetCard === draggedTodo) {
				return;
			}

			const targetPosition = targetCard.getBoundingClientRect();
			const insertAfter = event.clientY > targetPosition.top + targetPosition.height / 2;
			todosContainer.insertBefore(draggedTodo, insertAfter ? targetCard.nextSibling : targetCard);
		});

		todosContainer.addEventListener("drop", (event) => {
			if (!draggedTodo) {
				return;
			}

			event.preventDefault();
			const reorderedTodos = [...todosContainer.querySelectorAll(".card-item-list[draggable='true']")]
				.map((todoCard) => listTodos.find((todo) => `card-item-${todo.uid}` === todoCard.id))
				.filter(Boolean)
				.reverse();

			listTodos.splice(0, listTodos.length, ...reorderedTodos);
			saveTodos();
		});

		todosContainer.addEventListener("dragend", () => {
			draggedTodo?.classList.remove("dragging");
			draggedTodo = null;
		});

		

		const inputChecked = (event) => {
			const index = listTodos.findIndex(
				(todo) => `item-${todo.uid}` === event.target.id,
			);
			listTodos[index].checked = event.target.checked;
			saveTodos();
			loadTodos();
		};

		const addItem = () => {
			const uid = getUid();
			if (inputNewItem.value) {
				listTodos.push({
					uid: uid,
					description: inputNewItem.value,
					checked: false,
					createdAt: new Date().toISOString(),
				});
				saveTodos();
				loadTodos();
				inputNewItem.value = "";
			}
		};

		const getUid = () => {
			return `id${Math.random().toString(16).slice(2)}`;
		};

		const arquiveItem = (id) => {
			const index = listTodos.findIndex(
				(todo) => `card-item-${todo.uid}` === id,
			);
			listTodosArchiveds.push(listTodos[index]);
			saveArchiveTodos();
			listTodos.splice(index, 1);
			saveTodos();
			update();
		};

		const archiveAllItems = () => {
			if (listTodos.length === 0) {
				return;
			}

			listTodosArchiveds.push(...listTodos.splice(0, listTodos.length));
			saveTodos();
			saveArchiveTodos();
			update();
		};

		const editItem = (id) => {
			const index = listTodos.findIndex(
				(todo) => `text-item-${todo.uid}` === id,
			);
			const textItem = document.getElementById(id);
			
			textItem.contentEditable = true;
			textItem.focus();
			textItem.style.textDecorationLine='none';
			textItem.addEventListener('input', (e)=> {
				listTodos[index].description = e.target.textContent;
				saveTodos();
			})

			textItem.addEventListener('blur', ()=> {
				textItem.contentEditable = false;
				loadTodos();
			})
			textItem.addEventListener('keypress',(e)=> {
				if(e.code ==='Enter'){
					textItem.blur();
				}
			})
		};

		

		const restoreItem = (id) => {
			const index = listTodosArchiveds.findIndex(
				(todo) => `card-item-${todo.uid}` === id,
			);
			if(!index && index< 0){
				return;
			}
			listTodos.push(listTodosArchiveds[index]);
			saveTodos();
			listTodosArchiveds.splice(index, 1);
			saveArchiveTodos();
			update();
		};

		const deleteItem = (id) => {
			const index = listTodosArchiveds.findIndex(
				(todo) => `card-item-${todo.uid}` === id,
			);
			if(!index && index< 0){
				return;
			}
			listTodosArchiveds.splice(index, 1);
			saveArchiveTodos();
			update();
		};

		const deleteAllArchived = () => {
			if (listTodosArchiveds.length === 0) {
				return;
			}

			listTodosArchiveds.length = 0;
			saveArchiveTodos();
			update();
		};

		const showArquiveds = () => {
			const archiveds = document.getElementById('archiveds');
			viewArchiveds = !viewArchiveds;
			if (viewArchiveds){
				archiveds.style.display='flex';
				changeTextBtnShowArquiveds('Esconder Arquivados')				
			} else {
				archiveds.style.display='none';
				changeTextBtnShowArquiveds('Mostrar Arquivados')
			} 
		}

		const changeTextBtnShowArquiveds = ( text) => {
			const btn = document.getElementById('btn-show-archived');
			btn.innerText = text;
		}
		const update = () => {
			loadTodos();
			loadTodosArchived();
		}

			/* When the user clicks on the button,
toggle between hiding and showing the dropdown content */
const openMenu = (id)=> {
	document.getElementById(id).classList.toggle("show");
  }

  const closeMenu = (id)=> {
	const menu = document.getElementById(id);
	menu.classList.remove('show');
  }
		update();
  
  // Close the dropdown menu if the user clicks outside of it
  window.onclick = (event) => {
	if (!event.target.matches('.dropbtn')) {
	  const dropdowns = document.getElementsByClassName("dropdown-content");
	  for (let i = 0; i < dropdowns.length; i++) {
		const openDropdown = dropdowns[i];
		if (openDropdown.classList.contains('show')) {
		  openDropdown.classList.remove('show');
		}
	  }
	}
  }
		
