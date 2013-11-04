
function getMinutesFromTimeString(timeString) {
	var timeArr = timeString.split(':');
	if (timeArr && timeArr.length>=2) {
		return 60*parseInt(timeArr[0]) + parseInt(timeArr[1]);
	}
}

function formatTimeString(timeInSecs) {
	var secs = timeInSecs%60;
	if (secs<=9) secs = '0' + secs;
	return Math.floor(timeInSecs/60)+':'+secs;
}

var coursePageHeader = $('h2.course-page-header').text().toLowerCase();

if (coursePageHeader.indexOf('video')>=0) {
	//only the "Video Lectures" page
	$('ul.course-item-list-section-list').each(
			function(ind, elem) {
			    var subTotal = 0, watchedTotal = 0;

			    $(elem).find('li a.lecture-link').each(
			    		function(ind2, lectureLink) {
			    			var lectureTitle = $(lectureLink).text();
			    			var lectureTime = 0;
						    if (lectureTitle) {
						    	var lectureTimeStrings = /\([0-9]+\:[0-9]+\)/.exec(lectureTitle);
						    	if (lectureTimeStrings) {
						    		var lectureTimeString = lectureTimeStrings[0]; //first element only
						    		//strip out the parentheses
						    		if (lectureTimeString) {
						    			var justTime = lectureTimeString.substr(1, lectureTimeString.length-2);
						    			//subTotal += getMinutesFromTimeString(justTime);
						    			lectureTime = getMinutesFromTimeString(justTime);
						    		}
						    	}	
						    }
						    //console.log('--------------------');
						    var tt = $(lectureLink).parent().find('span.icon-ok');
						    //console.log(tt);
						    tt.each(function(j, ele) {
						    	//console.log($(ele).css('color'));
						    	if ($(ele).css('color') == 'rgb(0, 128, 0)') {
						    		watchedTotal += lectureTime;	
						    		return false;
						    	}	
						    });
						    
						    //console.log('====================')
						    subTotal += lectureTime;

			    		}
			    	);
				var totalTimeInfo = '<span class="ext-common totalSegmentTime">Total time ('+formatTimeString(subTotal)+')</span>';
				var toWatchTimeInfo = ''; 
				if ((subTotal-watchedTotal) > 0) {
					toWatchTimeInfo = '<span class="ext-common remainingTime">Remaining time ('+formatTimeString(subTotal-watchedTotal)+')</span>';	
				}
				
			    $(elem).prev().find('h3').append(totalTimeInfo).append(toWatchTimeInfo);
			}
		);


	//update the "remaining time" if the user toggles the watched icon
	$('span.icon-ok').on('change', function() {
		console.log('on change func got triggerred yea.1')
		console.log(this);
	}); 
}

function parseAttempts(attemptsElem) {
	var actualAttempts = 0, availableAttempts = 0;
	var attemptsText = $(attemptsElem).text();
	if (attemptsText) {
    	var attemptInfo = attemptsText.split('/');
    	if (attemptInfo) {
    		var actualAttemptsStr = attemptInfo[0].trim(); //first element
    		if (actualAttemptsStr) {
    			actualAttempts = parseInt(actualAttemptsStr);
    		}
    		var availableAttemptsStr = attemptInfo[1].trim();
    		if (availableAttemptsStr) {
    			availableAttempts = parseInt(availableAttemptsStr);
    		}
    	}
    }
    return [actualAttempts, availableAttempts];
}

function parseScore(scoreElem) {
	//console.log('3: '+$(scoreElem).text());
	//console.log('4: '+$(scoreElem).find('td span:first-child').text());
	var actualScore=0, maxScore = 0; 
	var scoreCardStr = $(scoreElem).find('td span')
		.contents()
		.filter(function() { 
			//console.log(this.nodeType)
    		return this.nodeType === 3;
  			})
		//.each(function(i, el) {
  		//		console.log(el);
  		//	});

		//console.log(scoreCardStr.text());

		if (scoreCardStr.text() == 'N/A') {
			return null;
		}

		var scoreCardArr = scoreCardStr.text().split("/");
		if (scoreCardArr) {
			actualScore = parseFloat(scoreCardArr[0]);
			maxScore = parseFloat(scoreCardArr[1]);
		}

	return [actualScore, maxScore];
} 

function constructScoreWidget(actualScore, maxScore, moreAttemptsAvailable) {
	console.log(moreAttemptsAvailable);
 return '<div class="scorebar" title="'+actualScore+'/'+maxScore+'"><div class="'+(moreAttemptsAvailable?'':'disabled')+'" style="width:'+(actualScore*100/maxScore)+'%"></div></div>';
}

if (coursePageHeader.indexOf('quiz')>=0 || coursePageHeader.indexOf('exercise')>=0) {
	//only the "Quiz" page
	$('ul.course-item-list-section-list').each(
			function(ind, elem) {
			    var subTotal = 0;
			    $(elem).find('li tr.course-quiz-item-attempts td').each(
			    		function(ind2, attempts) {
			    			var infoText = '';
			    			var tmp = parseAttempts(attempts);
			    			var actualAttempts = tmp[0];
			    			var availableAttempts = tmp[1];
			    			//console.log($(attempts).text());
			    			//console.log('actualAttempts = '+actualAttempts);

			    			tmp = parseScore($(attempts).parent().parent().find('tr.course-quiz-item-score'));
			    			var actualScore = tmp?tmp[0]:null;
			    			var maxScore = tmp?tmp[1]:null;	

			    			infoText += constructScoreWidget(actualScore, maxScore, availableAttempts>actualAttempts);

			    			if (actualAttempts <= 0) {
			    				infoText = '<span class="ext-common notAttempted">Not Attempted!</span>';
			    			}  else if (availableAttempts>actualAttempts 
			    					&& actualScore<maxScore) {
					    		//console.log('more aval');
								infoText = '<span class="ext-common moreAttemptsAvailable">You have more attempts</span>'
						    }
						    $(attempts).parent().parent().parent().parent().find('h4').append(infoText);
			    		}
			    	);
			}
		);
}
