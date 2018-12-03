//BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var Income = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
    };
    
    var calculateTotal = function(type){
        var sum = 0; 
        data.allItems[type].forEach(function(current){
            sum += current.value;
        });
        data.totals[type] = sum;
    };
    
    var data = {
        allItems: {
            expense: [],
            income: []
        },
        totals: {
            expense: 0,
            income: 0
        },
        budget: 0,
        percentage: -1
    };
    
    return{
      addItem: function(type, des, val){
          var newItem, ID;
          
          //[1 2 3 4 5 ], next Should be = 6
          //ID = lastID + 1

          //create new ID
          if(data.allItems[type].length > 0){
          ID = data.allItems[type][data.allItems[type].length - 1].id + 1;
          }else{
            ID = 0;
          }
          
          //create new item based on 'income' or 'expense' type
          if(type === 'expense'){
              newItem = new Expense(ID, des, val);
          }else if(type === 'income'){
              newItem = new Income(ID, des, val);
          }
          //push it into the data structure 
          data.allItems[type].push(newItem);
          
          //return the new element
          return newItem;
      },

      deleteItem: function(type, id){
          var ids, index;
          
          ids = data.allItems[type].map(function(current){
              return current.id;
          });

          index = ids.indexOf(id);

          if(index !== -1){
            data.allItems[type].splice(index, 1);
          }
      },
        
      calculateBudget: function(){
          //1. calculate total income & expenses
          calculateTotal('expense');
          calculateTotal('income');
          
          //2. calculate the Budget = income - expense
            data.budget = data.totals.income - data.totals.expense; 
          
          //3. Calculate the percentage of income that spent
          if(data.totals.income > 0){
              data.percentage = Math.round((data.totals.expense / data.totals.income) * 100);
          }else{
              data.percentage = -1;
          }
          
          
      },
        
      getbudget: function(){
          return{
              budget: data.budget,
              totalInc: data.totals.income,
              totalExp: data.totals.expense,
              percentage: data.percentage
          };
      }
        
        
    };

})();

//UI CONTROLLER
var UIController = (function(){
    
    var DOMstring = {
        inputType: '.add__type',
        inputDescription: '.add__description',
        inputValue: '.add__value',
        inputBtn: '.add__btn',
        expenseContainer: '.expenses__list',
        incomeContainer: '.income__list',
        budgetLabel: '.budget__value',
        incomeLabel: '.budget__income--value',
        expenseLabel: '.budget__expenses--value',
        percentageLabel: '.budget__expenses--percentage',
        container: '.container'
    };
    
    return{
        getInput: function(){
            return{
                type: document.querySelector(DOMstring.inputType).value, //Will get either income or expense
                desc: document.querySelector(DOMstring.inputDescription).value,
                value: parseFloat(document.querySelector(DOMstring.inputValue).value)
                };
            },
        
        addListItem: function(obj, type){
            var html, newHtml, element;
            //Create HTML string with placeholder text
            if(type === 'income'){
                element = DOMstring.incomeContainer;
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">+%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'expense'){
                element = DOMstring.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">-%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', obj.value);
            
            //Insert the HTML to the DOM
            document.querySelector(element).insertAdjacentHTML('beforeend', newHtml);
            
            
        },

        deleteListItem: function(selectorID) {

            var el = document.getElementById(selectorID);
            el.parentNode.removeChild(el);
        },
        
        clearFields: function(){
            var fields, fieldsArr;
            
            fields = document.querySelectorAll(DOMstring.inputDescription + ', ' + DOMstring.inputValue);
            
            fieldsArr = Array.prototype.slice.call(fields);
            
            fieldsArr.forEach(function(current, index, array){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
          
            document.querySelector(DOMstring.budgetLabel).textContent = obj.budget; 
            document.querySelector(DOMstring.incomeLabel).textContent = obj.totalInc; 
            document.querySelector(DOMstring.expenseLabel).textContent = obj.totalExp; 
            
            if(obj.percentage > 0){
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';

            }else{
                document.querySelector(DOMstring.percentageLabel).textContent = '--';
            }
            
        },
        
        getDOMstring: function(){
            return DOMstring;
            }
        
    };
    
})();

//GLOBAL APP CONTROLLER
var controller = (function(budgetCtrl, UICtrl){
    
    var setupEventListeners = function(){
        var DOM = UICtrl.getDOMstring();
        document.querySelector(DOM.inputBtn).addEventListener('click', ctrlAddItem);
    
        document.addEventListener('keypress', function(event){
            if(event.keyCode === 13 || event.which === 13){
            ctrlAddItem();
            }
        });

        document.querySelector(DOM.container).addEventListener('click', ctrlDeleteItem);
          
    };
    
    
    var updateBudget = function(){
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the Budget
        var budget = budgetCtrl.getbudget();
        
        //3. Display the budget on the UI 
        UICtrl.displayBudget(budget);
    };
    
    
    var ctrlAddItem = function(){
        var input, newItem;
        
        //1. Get the field input data
        input = UICtrl.getInput();
        
        if(input.desc !== "" && !isNaN(input.value) && input.value > 0){
        
        //2. Add the item to the Budget controller
        newItem = budgetCtrl.addItem(input.type, input.desc, input.value);
        //3. Add the item to the UI
        UICtrl.addListItem(newItem, input.type);
        
        //4. Clear the fields
        UICtrl.clearFields();
        
        //Calculate & Update Budget
        updateBudget();
        }
    };

    var ctrlDeleteItem = function(event){
        var itemID, splitID, type , ID;

        itemID = event.target.parentNode.parentNode.parentNode.parentNode.id;
        if(itemID){
            splitID = itemID.split('-');
            type = splitID[0];
            ID = parseInt(splitID[1]); 

            //1. Delete the Item from Data Structure
            budgetCtrl.deleteItem(type, ID);

            //2. Delete the item from the UI
            UICtrl.deleteListItem(itemID);
            //3. Update the Budget & Show
            updateBudget();


        }
    };
    
    
   return{
       init: function(){
           console.log('App is started');
           UICtrl.displayBudget({
               budget: 0,
              totalInc: 0,
              totalExp: 0,
              percentage: -1
           });
           setupEventListeners();
           
       }
   };
    
    
    
    
})(budgetController, UIController);

controller.init();








