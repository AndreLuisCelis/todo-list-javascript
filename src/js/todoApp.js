
		const listTodos = JSON.parse(localStorage.getItem("todos")) || [];
		const listTodosArchiveds = JSON.parse(localStorage.getItem("archiveds")) || [];
		let viewArchiveds = false;
		const inputNewItem = document.getElementById("new-item");
		inputNewItem.addEventListener('keypress',(e)=> {
			if(e.code ==='Enter'){
				addItem();
			}
		})

		const loadTodos = () => {
			const listItems = document.getElementById("list-todos");
			listItems.innerHTML = "";
			listTodos.map((todo) => {
				if(!todo){
					return;
				}
				listItems.insertAdjacentHTML(
					"afterBegin",
					`
        <div class="card-item-list ${todo.checked ? "bg-success" : "bg-white"}" id="card-item-${todo.uid}" >
			<div>
            <input type="checkbox" name="sixth" id="item-${todo.uid}" onchange="inputChecked(event)" 
            ${todo.checked ? "checked" : ""} >
			</div>

            <label>
				<p id="text-item-${todo.uid}" class = ${todo.checked ?"text-line":null} for="item${todo.uid}">${todo.description}</p>
			</label>
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
             <label>
				<p id="text-item-${todo.uid}" class = ${todo.checked ?"text-line":null} for="item${todo.uid}">${todo.description}</p>
			</label>
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
		
