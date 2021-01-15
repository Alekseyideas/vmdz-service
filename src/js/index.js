'use strict';

const EX_LI = `<li class="list-group-item d-flex justify-content-between align-items-center">`;

const BTN_DELTE_EX = 'btnDeleteEx';
const BTN_UP_EX = 'btnUpEx';
const BTN_DOWN_EX = 'btnDownEx';

const DEF_EMTY_LIST_TEXT = 'Щоб зробити початок цікавим, додайте вправи';
const PR_EMTY_LIST_TEXT = 'Щоб організувати практичну діяльність, додайте вправи';
const REF_EMTY_LIST_TEXT = 'Щоб провести рефлексію та підбити підсумки, додайте вправи ';

const EMPTY_LIST_FN = (str = DEF_EMTY_LIST_TEXT) => `
	<li class="list-group"><span class="alert alert-light" role="alert">${str}</span></li>
`;

const inputValues = {
  propose: 'minilection',
};

const UI_ARROW =
  '<svg class="bi bi-chevron-right" width="32" height="32" viewBox="0 0 20 20" fill="currentColor" xmlns="http://www.w3.org/2000/svg"><path fill-rule="evenodd" d="M6.646 3.646a.5.5 0 01.708 0l6 6a.5.5 0 010 .708l-6 6a.5.5 0 01-.708-.708L12.293 10 6.646 4.354a.5.5 0 010-.708z"/></svg>';

const eqExesisesModalId = 'add-equipment-exesises';
const prExesisesModalId = 'add-practical-exesises';
const refExesisesModalId = 'add-reflection-exesises';

const setBtn = (modalId) => `.btnAddExesises[data-bs-target="#${modalId}"]`;

const btnAddEqExesises = document.querySelector(setBtn(eqExesisesModalId));
const btnAddPrExesises = document.querySelector(setBtn(prExesisesModalId));
const btnAddRefExesises = document.querySelector(setBtn(refExesisesModalId));

const globalExersises = {};

//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
// тут логика работы добавления упражнений

class Exercise {
  constructor(blockId = '', modalId = '', apiLink = '') {
    this.modalId = modalId;
    this.modal = document.getElementById(modalId);
    this.block = document.getElementById(blockId);
    this.exersisesBlock = this.modal.querySelector('.exesises');
    this.blockId = blockId;
    this.link = apiLink;
    this.exersises = [];
  }

  getEmptyText() {
    switch (this.modalId) {
      case refExesisesModalId:
        return REF_EMTY_LIST_TEXT;
      case prExesisesModalId:
        return PR_EMTY_LIST_TEXT;
      default:
        return DEF_EMTY_LIST_TEXT;
    }
  }

  async getExersises() {
    try {
      const data = await fetch(this.link);
      const jsonData = await data.json();
      const arr = globalExersises[this.modalId] || [];
      this.exersises = jsonData.filter((itm) => !arr.find((itm2) => itm2.id === itm.id));
      return genResp(this.blockId, jsonData);
    } catch (e) {
      console.log(e, 'error');
      return genResp('', null, false, e);
    }
  }

  setErrorInModal() {
    if (!this.exersisesBlock) {
      console.error('class exesises in modal does not exist');
      return null;
    }

    this.exersisesBlock.innerHTML = `<div class="alert alert-danger" role="alert">Вибачте виникла помилка</div>`;
  }

  setListInModal() {
    if (!this.exersisesBlock) {
      console.error('class exesises in modal does not exist');
      return null;
    }

    if (!this.exersises || (this.exersises && !this.exersises[0])) {
      this.exersisesBlock.innerHTML = `<div class="alert alert-warning" role="alert">Вибачте вправ поки що немає</div>`;
    }

    this.exersisesBlock.innerHTML = '';

    this.exersises.map((ex) => {
      this.exersisesBlock.innerHTML += `
			<div class="form-check">
				<input class="form-check-input" data-id="${ex.id}" type="checkbox" value="" id="${this.modalId}-${ex.id}">
				<label class="form-check-label" for="${this.modalId}-${ex.id}">
					${ex.title}
				</label>
			</div>
			`;
    });
  }

  get selectedExersises() {
    const data = [];

    if (!this.exersisesBlock) {
      console.error('class exesises in modal does not exist');
      return null;
    }

    const checkboxes = this.exersisesBlock.querySelectorAll('input');

    if (checkboxes && checkboxes[0]) {
      checkboxes.forEach((element) => {
        const id = element.dataset.id;
        if (element.checked) {
          const itm = this.exersises.find((it) => String(it.id) === String(id));
          if (itm) data.push(itm);
        }
      });
    }
    return data;
  }

  setDataInBlock(data = []) {
    // const block = document.getElementById(this.blockId);
    console.log(this);
    if (!this.block) {
      console.error(this.blockId + ' does not exist');
      return null;
    }

    this.block.innerHTML = '';

    const arr = globalExersises[this.modalId] || [];
    const newArr = [...arr, ...data];
    const aSize = newArr.length;

    if (aSize === 0) {
      const text = this.getEmptyText();
      this.block.innerHTML = EMPTY_LIST_FN(text);
      return;
    }
    newArr.forEach((itm, i) => {
      if (!itm) return null;
      const isDisabledUp = i === 0 ? 'disabled' : null;
      const isDisabledDown = i + 1 === aSize ? 'disabled' : null;
      return (this.block.innerHTML += `
			<li class="list-group-item d-flex justify-content-between">
			<div class="ex-list-info">
				<p>
					<b>${itm.title}</b> <br />
					<span>${itm.body}</span>
				</p>
			</div>
			<div class="d-flex ex-list-btns-wrapper">
				<button class="btn btn-secondary btn-sm me-2 ${BTN_DELTE_EX}" id="${BTN_DELTE_EX}-${this.blockId}-${itm.id}" data-id="${itm.id}" type="button">Видалити</button>
				<button class="btn btn-success btn-sm me-2 ${BTN_UP_EX}"  id="${BTN_UP_EX}-${this.blockId}-${itm.id}" data-id="${itm.id}" type="button" ${isDisabledUp}>${UI_ARROW}</button>
				<button class="btn btn-success btn-sm ${BTN_DOWN_EX}" id="${BTN_DOWN_EX}-${this.blockId}-${itm.id}" data-id="${itm.id}" type="button" ${isDisabledDown}>${UI_ARROW}</button>
			</div>
		</li>
			`);
    });
    if (globalExersises[this.modalId]) {
      globalExersises[this.modalId] = [...globalExersises[this.modalId], ...data];
    } else {
      globalExersises[this.modalId] = data;
    }

    this.upPosListenerHandler();
    this.deleteListenerHandler();
    this.downPosListenerHandler();
  }

  submitModalListener() {
    const btnSubmit = this.modal.querySelector('.btn-submit-ex');
    btnSubmit.addEventListener('click', updateGlobalExersises.bind(this));

    function updateGlobalExersises() {
      const data = this.selectedExersises;
      this.setDataInBlock(data);
    }
  }

  deleteListenerHandler() {
    const btns = this.block.querySelectorAll(`.${BTN_DELTE_EX}`);
    if (btns && btns[0]) {
      btns.forEach((btn, i) => {
        btn.addEventListener('click', btnHandeler.bind(this, i));
      });

      function btnHandeler(position) {
        const newArr = [...globalExersises[this.modalId]];
        newArr.splice(position, 1);

        globalExersises[this.modalId] = newArr;
        console.log(newArr, 0);
        this.setDataInBlock([]);

        if (globalExersises[this.modalId] && !globalExersises[this.modalId][0]) {
          const text = this.getEmptyText();
          this.block.innerHTML = EMPTY_LIST_FN(text);
        }
      }
    }
  }

  upPosListenerHandler() {
    const btns = this.block.querySelectorAll(`.${BTN_UP_EX}`);

    if (btns && btns[0]) {
      btns.forEach((btn, i) => {
        const itmId = btn.dataset.id;

        btn.addEventListener('click', btnHandeler.bind(this, i));
      });

      function btnHandeler(position = 0) {
        const newArr = [...globalExersises[this.modalId]];
        const itm = globalExersises[this.modalId][position];
        newArr.splice(position, 1);
        newArr.splice(position - 1, 0, itm);
        globalExersises[this.modalId] = newArr;
        this.setDataInBlock([]);
      }
    }
  }

  downPosListenerHandler() {
    const btns = this.block.querySelectorAll(`.${BTN_DOWN_EX}`);

    if (btns && btns[0]) {
      btns.forEach((btn, i) => {
        const itmId = btn.dataset.id;

        btn.addEventListener('click', btnHandeler.bind(this, i));
      });

      function btnHandeler(position = 0) {
        const newArr = [...globalExersises[this.modalId]];
        const itm = globalExersises[this.modalId][position];
        newArr.splice(position, 1);
        newArr.splice(position + 1, 0, itm);
        globalExersises[this.modalId] = newArr;
        this.setDataInBlock([]);
      }
    }
  }

  init() {
    this.submitModalListener();
    if (
      !globalExersises[this.modalId] ||
      (globalExersises[this.modalId] && !globalExersises[this.modalId][0])
    ) {
      const text = this.getEmptyText();
      this.block.innerHTML = EMPTY_LIST_FN(text);
    }
  }
}

// hiden fn
function genResp({ blockId = '', data = null, succees = true, error = null }) {
  return {
    succees,
    blockId,
    data,
    error,
  };
}

//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
// тут тригеры и добавление новых упражнений
if (btnAddEqExesises) {
  const equipmentEx = new Exercise(
    'equipment-exesises',
    eqExesisesModalId,
    'data/equipment-exesises.json'
  );

  btnAddEqExesises.addEventListener('click', () => addExesisesFn(equipmentEx));
  equipmentEx.init();
}

const practicalEx = new Exercise(
  'practical-exesises',
  prExesisesModalId,
  'data/equipment-exesises.json'
);

if (btnAddPrExesises) {
  btnAddPrExesises.addEventListener('click', () => addExesisesFn(practicalEx));
  practicalEx.init();
}

if (btnAddRefExesises) {
  const reflectionEx = new Exercise(
    'reflection-exesises',
    refExesisesModalId,
    'data/equipment-exesises.json'
  );

  btnAddRefExesises.addEventListener('click', () => addExesisesFn(reflectionEx));
  reflectionEx.init();
}

//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
//_________________________________________________
// тут логика упражнений в тригеры
async function addExesisesFn(obj) {
  const exersises = await obj.getExersises();
  if (exersises.succees) obj.setListInModal();
  else return obj.setErrorInModal();
}

// обработка Теоретичний блок для селекта
const selectProppose = document.getElementById('propose');
const textAreaProppose = document.getElementById('propose-another');

if (selectProppose && textAreaProppose) {
  selectProppose.addEventListener('change', (e) => {
    if (e.target.value === 'another') {
      textAreaProppose.classList.remove('d-none');
    } else {
      if (!textAreaProppose.classList.contains('d-none')) textAreaProppose.classList.add('d-none');
      inputValues.propose = e.target.value;
    }
  });
  textAreaProppose.addEventListener('keypress', (e) => {
    inputValues.propose = e.target.value;
  });
}

class CustomForm {
  constructor(btn = '', formCardId = '', modalId = '', callBackAdd = () => null) {
    this.btn = btn;
    this.modalId = modalId;
    this.infoWrapper = btn.closest('p');
    this.formCardId = formCardId;
    this.formCard = document.getElementById(formCardId);
    this.isFormHidden = true;
    this.title = '';
    this.body = '';
    this.callBackAdd = callBackAdd;
  }

  showForm() {
    this.isFormHidden = false;
    this.infoWrapper.classList.add('d-none');
    this.formCard.classList.remove('d-none');
  }

  hideForm() {
    this.isFormHidden = true;
    this.infoWrapper.classList.remove('d-none');
    this.formCard.classList.add('d-none');
  }

  addToGlobalExersises() {
    if (!this.body || !this.title) return null;

    const t = new Date().getTime();

    const itm = {
      id: t,
      title: this.title,
      body: this.body,
    };
    if (globalExersises[this.modalId] && globalExersises[this.modalId][0]) {
      globalExersises[this.modalId] = [...globalExersises[this.modalId], itm];
    } else {
      globalExersises[this.modalId] = [itm];
    }
    this.callBackAdd();
    this.hideForm();
  }

  inputsHandler() {
    const titleInput = this.formCard.querySelector('input');
    const bodyInput = this.formCard.querySelector('textarea');

    titleInput.addEventListener('keypress', (e) => (this.title = e.target.value));
    bodyInput.addEventListener('keypress', (e) => (this.body = e.target.value));
  }

  btnHandler() {
    this.btn.addEventListener('click', this.showForm.bind(this));
    const btnCancel = this.formCard.querySelector('.btnCancel');
    const btnOk = this.formCard.querySelector('.btnOk');

    if (btnCancel) {
      btnCancel.addEventListener('click', this.hideForm.bind(this));
    }

    if (btnOk) {
      btnOk.addEventListener('click', this.addToGlobalExersises.bind(this));
    }
  }

  init() {
    if (!this.formCard) {
      console.error('No form card');
      return;
    }
    this.btnHandler();
    this.inputsHandler();
  }
}

const practicalCustomFormBtn = document.getElementById('practical-exesises-custom-btn');

if (practicalCustomFormBtn) {
  const practicalCustomForm = new CustomForm(
    practicalCustomFormBtn,
    'practical-exesises-custom-card-form',
    prExesisesModalId,
    practicalEx.setDataInBlock.bind(practicalEx)
  );
  practicalCustomForm.init();
}

(function pageGames() {
  const accordion = document.getElementById('accordionGames');

  if (accordion) {
    const links = accordion.querySelectorAll('a');
    let cachCard = '';
    links.forEach((a) => {
      a.addEventListener('click', clickHandler);

      function clickHandler(e) {
        e.preventDefault();
        if (this && this.dataset && this.dataset.id) {
          const emptyCard = document.getElementById('noInfo');
          const id = this.dataset.id;
          const oldCard = document.getElementById(cachCard);
          const activeCard = document.getElementById(id);

          if (!emptyCard.classList.contains('d-none')) emptyCard.classList.add('d-none');
          if (oldCard) oldCard.classList.add('d-none');
          activeCard.classList.remove('d-none');
          cachCard = id;
        } else {
          alert('Помилка, спробуйте пiзнiше');
          console.error(this);
        }
      }
    });
  }
})();
