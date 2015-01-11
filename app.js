var editor = ace.edit("editor");
    editor.setTheme("ace/theme/dawn");
    editor.getSession().setMode("ace/mode/text");

var sequenceData = './sequence_sample.json';

angular.module('myApp', ['ngRoute']).
factory('sequenceInfo', function($http) {
    return function() {
        return $http.get(sequenceData);
    };
}).
config(function($routeProvider) {
    $routeProvider.when('/tasks/:task', {
        template: '<h3 ng-bind-html="name"></h3>' + 
                    '<div id="info" ng-bind-html="info"></div>',
        controller: 'InfoCtrl'
    }).
    when('/', {
        template: '',
        controller: function($location) {  
                $location.path('/tasks/t0'); 
        }
    });
}).
controller('SequencesCtrl', function($scope, sequenceInfo) {
    sequenceInfo().success(function(data) {
        $scope.results = data[0];
    }).
    error(function() {
        alert('error');
    });
}).
controller('InfoCtrl', function($scope, $sce, sequenceInfo, $routeParams, $location, $rootScope) {
    sequenceInfo().then(function(data) {
        var sequence = data.data[0].sequences[0];
        var taskIndex = 1;

        $scope.task = $routeParams.task;
        switch($scope.task) {
            case 't0':
                editor.setValue('');
                infoPage(sequence.tasks[0].options.type, sequence.tasks[0].lines, sequence.tasks[0].name);
                $location.nextPage = 't5';
                $location.task = sequence.tasks[0];
                break;
            case 't5':
                editor.setValue('');
                infoPage(sequence.tasks[1].options.type, sequence.tasks[1].lines, sequence.tasks[1].name);
                $location.nextPage = 't6';
                $location.type = sequence.tasks[1].options.type;
                $location.task = sequence.tasks[1];
                break;
            case 't6':
                editor.setValue('');
                infoPage(sequence.tasks[2].options.type, sequence.tasks[2].lines, sequence.tasks[2].name);
                $location.nextPage = 't8';
                $location.type = sequence.tasks[2].options.type;
                $location.task = sequence.tasks[2];
                break;
            case 't8':
                editor.setValue('');
                infoPage(sequence.tasks[3].options.type, sequence.tasks[3].lines, sequence.tasks[3].name);
                break;
            default:
                alert('error');
        } //end switch

        editor.getSession().on('change', function(e) {
            if (e.data.action === 'insertText') {
                validate(e, sequence, $scope, function gotoNext() {
                    $scope.$apply(function() {
                        $location.path('/tasks/' + $location.nextPage);
                    });
                    taskIndex = 0;
                });     
            }
        });

        
        function validate(e, sequence, $scope, gotoNext) {
            if ($location.path() === '/tasks/t0' && e.data.text.charCodeAt() === 10) {
                gotoNext();
            }

            if ($location.type === 'code') {
                if (editor.getValue() === document.getElementById('info').textContent) {
                    var length = $location.task.lines.length;
                    function validateTask() {
                        if (taskIndex === length) {
                            gotoNext();
                        } else {
                            $scope.$apply(function() {

                                $scope.info = $sce.trustAsHtml($location.task.lines[taskIndex]);
                                editor.setValue('');
                            });
                        }
                    }
                    validateTask();
                    taskIndex++;
                } else {
                    //Set Highlighting here
                }
            }
        }
    });

    function infoPage(type, lines, name) {
        $scope.name = $sce.trustAsHtml(name)
        if (type === 'info') {
            $scope.info = $sce.trustAsHtml(lines);
        } else {
            $scope.info = $sce.trustAsHtml(lines[0]);
        }
    }
});