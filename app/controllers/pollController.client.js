'use strict';

(function () {
    
    var pollList = document.querySelector('#poll-list') || null;
    var myPollList = document.querySelector('#my-poll-list') || null;
    var pollQuestion = document.querySelector('#poll-question') || null;
    var deleteConfirm = document.querySelector('#delete-confirm') || null;
    var apiUrl = appUrl + '/api/poll';
    
    var pollId = '';
    if (pollQuestion) {
        var str = window.location.pathname;
        for (var i = str.length; i >= 0; i--) {
            if (str.charAt(i) === '/') {
                pollId = str.slice(i+1);
                break;
            }
        } 
        if (pollId.length > 0) {
            apiUrl += '?id=' + pollId;
        }
    } 
    if (myPollList) {
        apiUrl += '/user';
    }
    
    function getColors (n) {
        var colors = [];
        for (var i = 0; i < n; i++) {
            colors.push(
            "rgba("+Math.floor(256*Math.random()).toString()+","+Math.floor(256*Math.random()).toString()+","+Math.floor(256*Math.random()).toString()+",0.8)"
            );
        }
        return colors;
    }
    
    // By setting apiUrl, data will be either the list of all polls, user's
    // polls, or single poll document, as appropriate for the html page.
    ajaxFunctions.ready(ajaxFunctions.ajaxRequest('GET', apiUrl, function (data) {
        
        if (pollList) {
            data = JSON.parse(data);
            var newHtml = '';
            for (var i = 0; i < data.length; i++) {
                newHtml += '<a href="/poll/'+data[i]._id+'"><div class="row poll-row"><div class="col-xs-12 col-md-8 col-md-offset-2 poll-col"><p class="text-center">'+data[i].question+'</p></div></div></a>';
            }
            pollList.innerHTML = newHtml;
        }
        
        if (myPollList) {
            data = JSON.parse(data);
            var newHtml = '';
            for (var i = 0; i < data.length; i++) {
                newHtml += '<a href="/poll/'+data[i]._id+'"><div class="row poll-row"><div class="col-xs-12 col-md-8 col-md-offset-2 poll-col"><p class="text-center">'+data[i].question+'</p></div></div></a>';
            }
            myPollList.innerHTML = newHtml;
        }
        
        if (pollQuestion) {
            data = JSON.parse(data);
            
            // If poll wasn't found, redirect to home page.
            if (!data.hasOwnProperty('question'))  {
                console.log('Poll not found, redirecting...');
                return window.location = appUrl;
            } else {
                
                // Extract poll data and populate standard html objects.
                var choiceSelect = document.querySelector('#choice-select');
                
                pollQuestion.innerHTML = data.question;
                for (var i = 0; i < data.choiceList.length; i++) {
                    choiceSelect.innerHTML += '<option>'+data.choiceList[i].choice+'</option>';
                }
                
                var tweetButton = document.querySelector('#tweet-button');
                tweetButton.onclick = function () {
                     window.location = 
                        'https://twitter.com/intent/tweet?text=' + 
                        encodeURIComponent(data.question) +
                        '&url=' +
                        encodeURIComponent(window.location.href);
                };
                
                document.querySelector('#poll-id').value = pollId;
                
                // If user owns poll, show delete button and attach handler.
                // Do same for delete-confirm box and its buttons.
                var deleteButton = document.querySelector('#delete-button');
                
                if (data.userOwned === 'true') {
                    deleteButton.classList.remove('hidden');
                    deleteButton.addEventListener('click', function () {
                        deleteConfirm.classList.remove('hidden');
                    });
                    
                    var deleteYes = document.querySelector('#delete-yes-button');
                    deleteYes.addEventListener('click', function () {
                        ajaxFunctions.ajaxRequest('DELETE', appUrl + '/api/poll?id=' + pollId, function (req, res) {
                            window.location = appUrl + '/mypolls';
                        });
                    });
                    
                    var deleteNo = document.querySelector('#delete-no-button');
                    deleteNo.addEventListener('click', function () {
                         deleteConfirm.classList.add('hidden');
                    });
                }
                
                // Build the chart using charts.js.
                var labels = [];
                var chartData = [];
                for (var i = 0; i < data.choiceList.length; i++) {
                    labels.push(data.choiceList[i].choice);
                    chartData.push(data.choiceList[i].votes);
                }
                
                // Note: this is actually a canvas object, not a rendering
                // context, but chart.js doesn't care.
                var ctx = document.querySelector('#chart');
                
                Chart.defaults.global.defaultFontColor = '#fff';
                
                var chart = new Chart(ctx, {
                    type: 'pie',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '# of Votes',
                            data: chartData,
                            backgroundColor: getColors(data.choiceList.length)
                        }]
                    }
                });
                //-------------------------------------------------------------
                // Alternate bar chart. Currently not in use.
                /*
                var chart = new Chart(ctx, {
                    type: 'bar',
                    data: {
                        labels: labels,
                        datasets: [{
                            label: '# of Votes',
                            data: chartData,
                            backgroundColor: getColors(data.choiceList.length)
                        }]
                    },
                    options: {
                        scales: {
                            yAxes: [{
                                ticks: {
                                    beginAtZero: true
                                }
                            }]
                        }
                    }
                });
                */
                //-------------------------------------------------------------
            }
        }
    }));
})();