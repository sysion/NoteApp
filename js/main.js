let notesArray = [];
let isLocalStorage = false;

if (typeof Storage !== 'undefined') {
	isLocalStorage = true;
} else {
	alert('No browser storage support');
}

let addButton = document.querySelector('.add-button');
let notes = document.querySelector('.notes');

window.addEventListener('load', loadNoteFromStorage);

addButton.addEventListener('click', function(){	
	addNote(notes);
});  

function generateId(dbArray){
	let now = new Date().valueOf();
	
	if (dbArray.indexOf(now) != -1){
		now += 1;
	}

	return now;
}

function randomBetween(min, max){
	return Math.floor(Math.random() * (max - min + 1) + min);
}

function createNote(){
	let noteContainer = document.createElement('div');
	noteContainer.className = 'note-container';
	noteContainer.innerHTML = `
		<div class='note-header'> 
			<div class='note-header-icon'> 
				<i class='edit-note'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-pencil-square" viewBox="0 0 16 16"><path d="M15.502 1.94a.5.5 0 0 1 0 .706L14.459 3.69l-2-2L13.502.646a.5.5 0 0 1 .707 0l1.293 1.293zm-1.75 2.456-2-2L4.939 9.21a.5.5 0 0 0-.121.196l-.805 2.414a.25.25 0 0 0 .316.316l2.414-.805a.5.5 0 0 0 .196-.12l6.813-6.814z"/><path fill-rule="evenodd" d="M1 13.5A1.5 1.5 0 0 0 2.5 15h11a1.5 1.5 0 0 0 1.5-1.5v-6a.5.5 0 0 0-1 0v6a.5.5 0 0 1-.5.5h-11a.5.5 0 0 1-.5-.5v-11a.5.5 0 0 1 .5-.5H9a.5.5 0 0 0 0-1H2.5A1.5 1.5 0 0 0 1 2.5v11z"/></svg></i>
				<i class='delete-note'><svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" fill="currentColor" class="bi bi-trash" viewBox="0 0 16 16"><path d="M5.5 5.5A.5.5 0 0 1 6 6v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm2.5 0a.5.5 0 0 1 .5.5v6a.5.5 0 0 1-1 0V6a.5.5 0 0 1 .5-.5zm3 .5a.5.5 0 0 0-1 0v6a.5.5 0 0 0 1 0V6z"/><path fill-rule="evenodd" d="M14.5 3a1 1 0 0 1-1 1H13v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V4h-.5a1 1 0 0 1-1-1V2a1 1 0 0 1 1-1H6a1 1 0 0 1 1-1h2a1 1 0 0 1 1 1h3.5a1 1 0 0 1 1 1v1zM4.118 4 4 4.059V13a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1V4.059L11.882 4H4.118zM2.5 3V2h11v1h-11z"/></svg></i>
			</div>
		</div>

		<div class='note-body'> 
			<div class='note-div'></div>
			<textarea class='note-area'></textarea>
		</div>`;

	return noteContainer;
}

function addNote(allNotes, inputText = null){
	let newNote = createNote();
	newNote.id = generateId(notesArray);

	let editButton = newNote.querySelector('.edit-note'); 
    let deleteButton = newNote.querySelector('.delete-note');
    let noteDiv = newNote.querySelector('.note-div');
    let noteArea = newNote.querySelector('.note-area');

    let noteText = '';

    editButton.addEventListener('click', function(e){
		editNote(newNote);
	});  

	deleteButton.addEventListener('click', function(e){
		let scrapNote = e.target.closest('.note-container');
		deleteNote(scrapNote);
	});

	noteArea.addEventListener('change', function(e){
		noteText = e.target.value;;
		noteDiv.innerHTML = noteText.replace(/\r?\n/g, '<br/>');

		let elem = e.target.closest('.note-container');
	
		let changedElem = notesArray.filter(el => {
			return Object.keys(el)[0] == elem.id;
		});
		
		let index = -1;
		if (changedElem){	//this is True if array changedElem is not [] or undefined
			index = notesArray.indexOf(changedElem[0]);
		}
		console.log("index => "+index);
		if (index !== -1){
			let editedNote = {};
			editedNote[Object.keys(changedElem[0])[0]] = noteText;
			notesArray[index] = editedNote;
		}

		//update changes in localStorage
		updateNoteInStorage(notesArray);
	});  
	
	let savedNote = {};

    let oldNote = false;
    let idx = -1;

    if (inputText != null){
    	idx = notesArray.indexOf(inputText);

    	if (idx > -1){
    		oldNote = true;
    		newNote.id = Object.keys(inputText)[0];
    		noteText = Object.values(inputText)[0];
    	}
   		
    	console.log('oldNote Check: newNote.id => '+newNote.id+', noteText => '+noteText);
    }
    
	savedNote[newNote.id] = noteText;
	
	allNotes.appendChild(newNote);

	if (oldNote){
		notesArray[idx] = savedNote;

		noteArea.value = noteText;;
		noteDiv.innerHTML = noteText.replace(/\r?\n/g, '<br/>');
	}
	else{
		notesArray.push(savedNote);
	}
	
	//save to localStorage
	saveNoteToStorage(notesArray);
	
}

function editNote(elem){
	let noteArea = elem.querySelector('.note-area');
	noteArea.classList.toggle('hidden');
}

function deleteNote(elem){
	
	// filter() always returns an array
	let filteredElem = notesArray.filter(el => {
		return elem.id === Object.keys(el)[0];
	});
	
	if (Object.keys(filteredElem[0])[0] == elem.id){
		let index = notesArray.indexOf(filteredElem[0]);
		notesArray.splice(index, 1);
		notes.removeChild(elem);
	}

	deleteNoteFromStorage(notesArray);
}

function getNoteFromStorage(){
	if (isLocalStorage) {
     	return JSON.parse(localStorage.getItem("notesArray")) || [];  //results in an array of note objects.
    }
}

function saveNoteToStorage(notes){
	localStorage.setItem("notesArray", JSON.stringify(notes));
}

function updateNoteInStorage(notes){
	saveNoteToStorage(notes);
}

function deleteNoteFromStorage(notes){
	saveNoteToStorage(notes);
}

function loadNoteFromStorage(){
	notesArray = getNoteFromStorage();
	console.log("all notes => "+notesArray.length);
	
	if (notesArray.length > 0){
		notesArray.forEach(function(note){
			addNote(notes, note);
		});
	}
}