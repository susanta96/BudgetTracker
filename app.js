//BUDGET CONTROLLER
var budgetController = (function(){
    
    var Expense = function(id, description, value){
        this.id = id;
        this.description = description;
        this.value = value;
        this.percentage = -1;
    };

    Expense.prototype.calcPercentage = function(totalInc){
        if(totalInc > 0){
        this.percentage = Math.round((this.value / totalInc) * 100);
        } else{
            this.percentage = -1;
        }
    };

    Expense.prototype.getPercentage = function(){
        return this.percentage;
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

      calculatePercentages: function(){
            data.allItems.expense.forEach(function(cur){
                cur.calcPercentage(data.totals.income);
            });
      },

      getPercentages: function(){
            var allPerc = data.allItems.expense.map(function(cur){
                return cur.getPercentage();
            });
            return allPerc;
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
        container: '.container',
        expPercentageLabel: '.item__percentage',
        dateLabel: '.budget__title--month'
    };

    var formatNumber = function(num, type){
        var decimal, numSplit, int;
        /*
            + or - brfore the number
            exactly 2 decimal points 
            comma separation the thousand

            2340.344 --> + 2,340.34
        */
        num = Math.abs(num);
        num = num.toFixed(2);

        numSplit = num.split('.');
        int = numSplit[0];
        if(int.length > 3){
            int = int.substr(0, int.length - 3) + ',' + int.substr(int.length - 3, 3);
        }

        decimal = numSplit[1];
        

        return (type === 'expense' ? '-' : '+') + ' ' + int +'.'+ decimal;
    };

    var nodeListForEach = function(list, callback){
        for(var i = 0; i< list.length; i++){
            callback(list[i], i);
        }
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
                html = '<div class="item clearfix" id="income-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }else if(type === 'expense'){
                element = DOMstring.expenseContainer;
                html = '<div class="item clearfix" id="expense-%id%"><div class="item__description">%description%</div><div class="right clearfix"><div class="item__value">%value%</div><div class="item__percentage">21%</div><div class="item__delete"><button class="item__delete--btn"><i class="ion-ios-close-outline"></i></button></div></div></div>';
            }
            
            //Replace the placeholder text with actual data
            newHtml = html.replace('%id%', obj.id);
            newHtml = newHtml.replace('%description%', obj.description);
            newHtml = newHtml.replace('%value%', formatNumber(obj.value, type));
            
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
            
            fieldsArr.forEach(function(current){
                current.value = "";
            });
            
            fieldsArr[0].focus();
        },
        
        displayBudget: function(obj){
            var type;
            obj.budget > 0 ? type = 'income' : type = 'expense';
            document.querySelector(DOMstring.budgetLabel).textContent = formatNumber(obj.budget, type); 
            document.querySelector(DOMstring.incomeLabel).textContent = formatNumber(obj.totalInc, 'income'); 
            document.querySelector(DOMstring.expenseLabel).textContent = formatNumber(obj.totalExp, 'expense'); 
            
            if(obj.percentage > 0){
                document.querySelector(DOMstring.percentageLabel).textContent = obj.percentage + '%';

            }else{
                document.querySelector(DOMstring.percentageLabel).textContent = '--';
            }
            
        },

        displayPercentages: function(percentages){

            var fields = document.querySelectorAll(DOMstring.expPercentageLabel);

            nodeListForEach(fields, function(cur, index){
                if(percentages[index] > 0){
                cur.textContent = percentages[index] + '%';
                }else{
                    cur.textContent = '--';
                }
            });
        },

        displayMonth: function(){
            var now, year, month;
            now = new Date();
            months = ['January', 'February', 'March', 'April', 'May', 'June','July','August','September','October', 'November','December'];
            month = now.getMonth();
            year = now.getFullYear(); 
            document.querySelector(DOMstring.dateLabel).textContent = months[month] + ' ' + year;
            
        },

        changedType: function(){

            var fields = document.querySelectorAll(
                DOMstring.inputType + ',' +
                DOMstring.inputDescription + ',' + 
                DOMstring.inputValue
            );

            nodeListForEach(fields, function(cur){
                cur.classList.toggle('red-focus');
            });
            document.querySelector(DOMstring.inputBtn).classList.toggle('red');
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
        document.querySelector(DOM.inputType).addEventListener('change', UICtrl.changedType);
    };
    
    
    var updateBudget = function(){
        //1. Calculate the budget
        budgetCtrl.calculateBudget();
        
        //2. Return the Budget
        var budget = budgetCtrl.getbudget();
        
        //3. Display the budget on the UI 
        UICtrl.displayBudget(budget);
    };

    var updatePercentages = function(){
        //1. cal percentage
        budgetCtrl.calculatePercentages();
        //2. Read percentage frome budget controller
        var percentages = budgetCtrl.getPercentages();

        //3. Update the UI with the new percentages
        UICtrl.displayPercentages(percentages);
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

        // 6. Calculate & update Percentages
        updatePercentages();
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
            //4. Calculate & update Percentages
            updatePercentages();


        }
    };
    
    
   return{
       init: function(){
           console.log('App is started');
           UICtrl.displayMonth();
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








