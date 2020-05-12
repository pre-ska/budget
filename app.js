var budgetController = (() => {
  var Expense = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var Income = function(id, description, value) {
    this.id = id;
    this.description = description;
    this.value = value;
  };

  var calculateTotal = type => {
    var sum = 0;
    data.allItems[type].forEach(cur => (sum += cur.value));
    data.totals[type] = sum;
  };

  var data = {
    allItems: {
      exp: [],
      inc: []
    },
    totals: {
      exp: 0,
      inc: 0
    },
    budget: 0
  };

  return {
    setData: a => (data = a),

    addItem: (type, des, val) => {
      var newItem,
        ID = Date.now();

      if (type === "exp") newItem = new Expense(ID, des, val);
      else if (type === "inc") newItem = new Income(ID, des, val);

      data.allItems[type].push(newItem);

      return newItem;
    },

    deleteItem: (type, id) => {
      data.allItems[type] = data.allItems[type].filter(curr => curr.id !== id);
    },

    calculateBudget: () => {
      calculateTotal("exp");
      calculateTotal("inc");

      data.budget = data.totals.inc - data.totals.exp;

      localStorage.setItem("allData", JSON.stringify(data));
    },

    getBudget: () => ({
      budget: data.budget,
      totalInc: data.totals.inc,
      totalExp: data.totals.exp
    })
  };
})();

var UIController = (() => {
  var DOM_STRINGS = {
    inputType: ".add__type",
    inputDescription: ".add__description",
    inputValue: ".add__value",
    inputBtn: ".add__btn",
    incomeContainer: ".income__list",
    expensesContainer: ".expenses__list",
    budgetLabel: ".budget__value",
    incomeLabel: ".budget__income--value",
    expensesLabel: ".budget__expenses--value",
    container: ".container",
    dateLabel: ".budget__title--month"
  };

  var formatNumber = num => {
    const formatter = new Intl.NumberFormat("hr", {
      style: "currency",
      currency: "HRK",
      minimumFractionDigits: 2
    }).format(num);

    return formatter;
  };

  return {
    getInput: () => {
      return {
        type: document.querySelector(DOM_STRINGS.inputType).value,
        description: document.querySelector(DOM_STRINGS.inputDescription).value,
        value: parseFloat(document.querySelector(DOM_STRINGS.inputValue).value)
      };
    },

    addListItem: (obj, type) => {
      var html, element;

      if (type === "inc") {
        element = DOM_STRINGS.incomeContainer;

        html = `<div class="item clearfix" id="inc-${
          obj.id
        }"> <div class="item__description">${
          obj.description
        }</div><div class="right clearfix"><div class="item__value">+ ${formatNumber(
          obj.value
        )}</div><div class="item__delete"><div class="item__delete--btn green"></div></div></div></div>`;
      } else if (type === "exp") {
        element = DOM_STRINGS.expensesContainer;

        html = `<div class="item clearfix" id="exp-${
          obj.id
        }"><div class="item__description">${
          obj.description
        }</div><div class="right clearfix"><div class="item__value">- ${formatNumber(
          obj.value
        )}</div><div class="item__delete"><div class="item__delete--btn red"></div></div></div></div>`;
      }

      document.querySelector(element).insertAdjacentHTML("beforeend", html);
    },

    deleteListItem: selectorID => {
      var el = document.getElementById(selectorID);
      el.parentNode.removeChild(el);
    },

    clearFields: () => {
      var fields, fieldsArr;

      fields = document.querySelectorAll(
        `${DOM_STRINGS.inputDescription}, ${DOM_STRINGS.inputValue}`
      );

      fieldsArr = Array.prototype.slice.call(fields);

      fieldsArr.forEach(curr => (curr.value = ""));

      fieldsArr[0].focus();
    },

    displayBudget: obj => {
      document.querySelector(
        DOM_STRINGS.budgetLabel
      ).textContent = formatNumber(obj.budget);

      document.querySelector(
        DOM_STRINGS.incomeLabel
      ).textContent = formatNumber(obj.totalInc, "inc");

      document.querySelector(
        DOM_STRINGS.expensesLabel
      ).textContent = formatNumber(obj.totalExp, "exp");
    },

    displayMonth: () => {
      var now, months, month, year;

      now = new Date();

      months = [
        "Siječanj",
        "Veljača",
        "Ožujak",
        "Travanj",
        "Svibanj",
        "Lipanj",
        "Srpanj",
        "Kolovoz",
        "Rujan",
        "Listopad",
        "Studeni",
        "Prosinac"
      ];

      month = now.getMonth();

      year = now.getFullYear();
      document.querySelector(
        DOM_STRINGS.dateLabel
      ).textContent = `${months[month]} ${year}`;
    },

    changedType: value => {
      if (value === "exp")
        document.querySelector(
          DOM_STRINGS.inputBtn
        ).style.backgroundImage = `url("ico/checkmark_red.png")`;
      else
        document.querySelector(
          DOM_STRINGS.inputBtn
        ).style.backgroundImage = `url("ico/checkmark_green.png")`;
    },

    get_DOM_STRINGS: () => DOM_STRINGS
  };
})();

var controller = ((budgetCtrl, UICtrl) => {
  var initialData = {
    budget: 0,
    totalInc: 0,
    totalExp: 0
  };

  var setupEventListeners = () => {
    var DOM = UICtrl.get_DOM_STRINGS();

    document.querySelector(DOM.inputBtn).addEventListener("click", ctrlAddItem);

    document.addEventListener("keypress", e => {
      if (e.keyCode === 13 || e.which === 13) ctrlAddItem();
    });

    document
      .querySelector(DOM.container)
      .addEventListener("click", ctrlDeleteItem);

    document
      .querySelector(DOM.inputType)
      .addEventListener("change", e => UICtrl.changedType(e.target.value));
  };

  var updateBudget = () => {
    budgetCtrl.calculateBudget();

    var budget = budgetCtrl.getBudget();

    UICtrl.displayBudget(budget);
  };

  var ctrlAddItem = () => {
    var input, newItem;

    input = UICtrl.getInput();

    if (input.description !== "" && !isNaN(input.value) && input.value > 0) {
      newItem = budgetCtrl.addItem(input.type, input.description, input.value);

      UICtrl.addListItem(newItem, input.type);

      UICtrl.clearFields();

      updateBudget();
    }
  };

  var ctrlDeleteItem = e => {
    var itemID, splitID, type, ID;

    itemID = e.target.parentNode.parentNode.parentNode.id;

    if (itemID) {
      splitID = itemID.split("-");
      type = splitID[0];
      ID = parseInt(splitID[1]);

      budgetCtrl.deleteItem(type, ID);

      UICtrl.deleteListItem(itemID);

      updateBudget();
    }
  };

  var getStorage = () => {
    var LS = localStorage.getItem("allData"),
      _ls;

    if (LS) {
      _ls = JSON.parse(LS);

      initialData.budget = _ls.budget;
      initialData.totalInc = _ls.totals.inc;
      initialData.totalExp = _ls.totals.exp;

      budgetCtrl.setData(_ls);

      _ls.allItems.exp.map(item => UICtrl.addListItem(item, "exp"));
      _ls.allItems.inc.map(item => UICtrl.addListItem(item, "inc"));
    }
  };

  return {
    init: () => {
      getStorage();
      UICtrl.displayMonth();
      UICtrl.displayBudget(initialData);
      setupEventListeners();
    }
  };
})(budgetController, UIController);

controller.init();
