//import {getCurrentWordFromSentence, replaceWordInSentence} from "./services/wordsFunctions";

var myApp = angular.module('myApp', ['translate', 'ngClipboard']);
myApp.controller("sbController", ["$scope", "translate", "ngClipboard", "apiKey", "language",
function ($scope, translate, ngClipboard, apiKey, language) {
    $('[data-toggle="tooltip"]').tooltip()
    var $input = $("#input"),
        $results = angular.element(document.querySelector("#results"));

    $("#mainPanel").show();
    $input.focus();

    $scope.inputValue = "";
    $scope.resultsList = [];
    $scope.translatedSentence = "";
    $scope.copied = false;

    $scope.lang = language;
    $scope.changeLanguage = function(){
        language = $scope.lang;
        prepareTranslation($scope.inputValue);
        $input.focus();
    }

    $scope.copyResult = function(){
        ngClipboard.toClipboard($scope.inputValue);
        $scope.copied = true;
        $input.focus();
    }

    $scope.clearInput = function(){
        $scope.inputValue = "";
        $results.hide();
        $scope.translatedSentence = "";
        $scope.copied = false;
        $scope.resultsList = [];
        $input.focus();
    }

    $scope.change = function(){
        $scope.copied = false;
        if (!$scope.inputValue) {
            $results.hide();
            $scope.translatedSentence = "";
        }
        else {
            var word = getCurrentWord($input);
            prepareWordsList(word);
            prepareTranslation($scope.inputValue);
        }
    }

    function prepareWordsList(word){
        var listPromise = translate.getSuggestions(word, language, apiKey);
        $results.show();
        if (listPromise) {
            listPromise.then(result => $scope.resultsList = result.data ? result.data : result.map(item => item.word))
               .catch(error => $scope.resultsList = [error]);
        }
    }

    function prepareTranslation(sentence){
        translate.translateSentence(sentence, language, apiKey)
            .then(result => $scope.translatedSentence = result.data.join(';'))
            .catch(error => $scope.translatedSentence = error);
    }

    function getCurrentWord (element) {
        var target = element.get()[0];
        var position = target.selectionStart;
        var value = target.value;
        return getCurrentWordFromSentence(value, position);
   }

    $scope.textPosition = 0;
    $input.on("keydown", function(e){
        // DownArrow
        if (e.ctrlKey && e.which === 40) {
            console.log(e.which);
            var target = $input.get()[0];
            $scope.textPosition = target.selectionStart;
            $results.show();
            $results.focus();
            $("#results :first-child").attr('selected', true);
        }
        else if(e.which === 32){
            $results.hide();
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
        let inputValue = $scope.inputValue;
        $scope.inputValue = replaceWordInSentence(inputValue, $("#results option:selected").text(), $scope.textPosition);
        prepareTranslation($scope.inputValue);
        $results.hide();
        $input.focus();
    });
    $results.on('keypress', function(e){
        if(e.which === 32) {
            let inputValue = $scope.inputValue;
            $scope.inputValue = replaceWordInSentence(inputValue, $("#results option:selected").text(), $scope.textPosition);
            prepareTranslation($scope.inputValue);
            $results.hide();
            $input.focus();
        }
    });
    $results.on('keyup', function(e){
        if (e.which == 27) {
            $results.hide();
            $input.focus();
        }
    });
}]);
