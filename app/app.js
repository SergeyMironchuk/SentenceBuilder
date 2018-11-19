angular.module('myApp', ['translate', 'ngClipboard']).
controller("sbController", ["$scope", "translate", "ngClipboard", function ($scope, translate, ngClipboard) {
    var $input = $("#input"),
        $results = angular.element(document.querySelector("#results"));
    $input.focus();
    this.input = "";
    $scope.resultsList = [];
    $scope.translatedSentence = "";
    $scope.copied = false;

    $scope.copyResult = function(){
        ngClipboard.toClipboard($input.val());
        $scope.copied = true;
    }

    $scope.change = function(){
        $scope.copied = false;
        if (!$input.val()) {
            $results.hide();
            $scope.translatedSentence = "";
        }
        else {
            var word = getCurrentWord($input);
            prepareWordsList(word);
            prepareTranslation($input.val());
        }
    }

    function prepareWordsList(word){
        var listPromise = translate.getSuggestions(word);
        if (listPromise) {
            $results.show();
            listPromise.then(result => $scope.resultsList = result.data)
               .catch(error => $scope.resultsList = [error]);
        }
    }

    function prepareTranslation(sentence){
        translate.translateSentence(sentence)
            .then(result => $scope.translatedSentence = result.data.join(';'))
            .catch(error => $scope.translatedSentence = error);
    }

    function getCurrentWord (element) {
        var target = element.get()[0];
        var position = target.selectionStart;
        var value = target.value;
        var leftPart = value.substring(0, position);
        var rightPart = target.value.substring(position);
        if (leftPart.split('').pop() === ' '){ // word1 |word2
            return rightPart.split(' ').shift();
        }
        if (rightPart.split('').shift() === ' '){ // word1| word2
            return leftPart.split(' ').pop();
        }
        // wo|rd
        return leftPart.split(' ').pop() + rightPart.split(' ').shift();
   }

    $scope.textPosition = 0;
    $input.on("keydown", function(e){
        // DownArrow
        if (e.which === 40) {
            var target = $input.get()[0];
            $scope.textPosition = target.selectionStart;
            $results.show();
            $results.focus();
            $("#results :first-child").attr('selected', true);
        }
    });
    $input.on("keyup", function(e){
        // LeftArrow, RightArrow
        if (e.which === 37 || e.which === 39) {
            var word = getCurrentWord($input);
            prepareWordsList(word);
        }
    });
    $input.on("click", function(e){
        var word = getCurrentWord($input);
        prepareWordsList(word);
    });

    $results.on('click', function(){
        replaceWordInInput($input, $("#results option:selected").text());
        prepareTranslation($input.val());
        $results.hide();
    });
    $results.on('keydown', function(e){
        if(e.which === 32) {
            replaceWordInInput($input, $("#results option:selected").text());
            prepareTranslation($input.val());
            $results.hide();
        }
    });

    function replaceWordInInput(inputElement, newWord) {
        newWord = newWord.split('|').shift();
        let position = $scope.textPosition;
        let leftPart = inputElement.val().substring(0, position);
        let rightPart = inputElement.val().substring(position);
        let leftPartArray = leftPart.split(' ');
        let rightPartArray = rightPart.split(' ');
        leftPartArray.pop()
        rightPartArray.shift();
        let result = leftPartArray.join(' ')
            + ' '
            + newWord
            + ' '
            + rightPartArray.join(' ');

        inputElement.val(result.trim());
        inputElement.focus();
    };
}]);
