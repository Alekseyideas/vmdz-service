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

const EXAMPLE_DATA = [
  {
    title: 'Лови каструлю',
    body:
      'Учасники утворюють широке коло. Ведучий пропонує їм спіймати уявний предмет. Відтак оголошує ім’я колеги й називає предмет, який кидає. Той, хто його ловить, має швидко «прилаштуватися» до предмета, адже кошеня потрібно ловити інакше, ніж змію. Потім той, хто спіймав уявний предмет, так само оголошує ім’я колеги й називає предмет, який йому кидатиме',
    id: 1,
  },
  {
    title: 'Вправа 2',
    body:
      ' Lorem ipsum dolor sit amet, consectetur adipisicing elit. Architecto minima suscipit ducimus modi ratione nam enim eum dignissimos inventore similique animi, reiciendis asperiores sint nobis? Sapiente fugiat perspiciatis perferendis nam.',
    id: 2,
  },
];

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
    if (!this.block) {
      console.error(this.blockId + 'does not exist');
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
  }

  submitModalListener() {
    const btnSubmit = this.modal.querySelector('.btn-submit-ex');
    btnSubmit.addEventListener('click', updateGlobalExersises.bind(this));

    function updateGlobalExersises() {
      const data = this.selectedExersises;
      this.setDataInBlock(data);
      this.deleteListenerHandler();
      this.upPosListenerHandler();
    }
  }

  deleteListenerHandler() {
    const btns = this.block.querySelectorAll(`.${BTN_DELTE_EX}`);
    if (btns && btns[0]) {
      btns.forEach((btn) => {
        const itmId = btn.dataset.id;
        btn.addEventListener('click', btnHandeler.bind(this, btn, itmId));
      });

      function btnHandeler(btn = null, itmId = '') {
        const listItem = btn.closest('li');
        listItem.remove();
        globalExersises[this.modalId] = globalExersises[this.modalId].filter(
          (itm) => String(itm.id) !== String(itmId)
        );

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
        btn.addEventListener('click', btnHandeler.bind(this, btn, itmId, i));
      });
      let itmIdClicked = '';
      let clickCount = 1;
      function btnHandeler(btn = null, itmId = '', position = 0) {
        console.log(position, 'position');
        globalExersises[this.modalId] = [];
        this.setDataInBlock([]);

        const d = ['1', '2', '3', '4'];

        d.splice(1, 1);
        d.splice(2, 0, '2');

        console.log(d);
        // if (itmIdClicked !== itmId) {
        //   clickCount = 1;
        //   itmIdClicked = itmId;
        // }
        // const listItem = btn.closest('li');
        // const wrapperItems = btn.closest('ul');
        // const listItems = wrapperItems.querySelectorAll('li');

        // if (position - clickCount === 0) {
        //   btn.disabled = true;
        //   const btnNextItm = listItems[position - clickCount].querySelector(`.${BTN_UP_EX}`);
        //   btnNextItm.disabled = false;
        // }

        // wrapperItems.insertBefore(listItem, listItems[position - clickCount]);

        // console.log(clickCount);
        // globalExersises[this.modalId] = globalExersises[this.modalId].filter(
        //   (itm) => String(itm.id) !== String(itmId)
        // );

        // if (globalExersises[this.modalId] && !globalExersises[this.modalId][0]) {
        //   const text = this.getEmptyText();
        //   this.block.innerHTML = EMPTY_LIST_FN(text);
        // }
        clickCount++;
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

if (btnAddPrExesises) {
  const practicalEx = new Exercise(
    'practical-exesises',
    prExesisesModalId,
    'data/equipment-exesises.json'
  );

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
