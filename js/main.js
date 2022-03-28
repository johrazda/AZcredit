'Strict Mode';
// Add Event listeners
// Monitor change of current year
var node = document.querySelector('#current-year');
node.addEventListener('change', updateYears);

// Monitor scrolling of current or previous year info (tables)
node = document.querySelector('#current-year-info');
node.addEventListener('scroll', syncScroll);
node = document.querySelector('#previous-year-info');
node.addEventListener('scroll', syncScroll);

// Monitor click of buttons
node = document.querySelector('.clear-all');
node.addEventListener('click', clearAll);
node = document.querySelector('.calculate');
node.addEventListener('click', calculateCarryover);
node = document.querySelector('.training-aides-button');
node.addEventListener('click', displayAides);

// Monitor click of forms check box
node = document.querySelectorAll('.form-view-control');
node.forEach(function(e) {
	e.addEventListener('click', toggleHidden);
});

// Run this function after everything has been loaded.
window.addEventListener('load', function() {
	// This function will set a default year for current
	// January - October, the year is previous year
	// November - December, the current year.
	var node = document.querySelector('#current-year');
	var date = new Date();
	var year = date.getFullYear();
	var month = date.getMonth();
	if (month < 10) {
		year -= 1;
	}
	node.value = year;
	updateYears();
	updateLineReferences(year-1)
});

// Global variables

// IDs for view control
var viewCtlForms = [
	'form-309',
	'form-310',
	'form-321',
	'form-322',
	'form-323',
	'form-340',
	'form-348',
	'form-352'
];

var carryoverAvailable = [
	[ 'form-309', false ],
	[ 'form-310', true ],
	[ 'form-321', true ],
	[ 'form-322', true ],
	[ 'form-323', true ],
	[ 'form-340', false ],
	[ 'form-348', true ],
	[ 'form-352', true ]
];
var nbrForms = viewCtlForms.length;

// IDs for current & previous Forms 310, 321, 322, 323, 348, & 352
var currentForms = [
	'#current-table-309',
	'#current-table-310',
	'#current-table-321',
	'#current-table-322',
	'#current-table-323',
	'#current-table-340',
	'#current-table-348',
	'#current-table-352'
];

var previousForms = [
	'#previous-table-309',
	'#previous-table-310',
	'#previous-table-321',
	'#previous-table-322',
	'#previous-table-323',
	'#previous-table-340',
	'#previous-table-348',
	'#previous-table-352'
];

var previousContribution = [
	'previous-contribution-309',
	'previous-contribution-310',
	'previous-contribution-321',
	'previous-contribution-322',
	'previous-contribution-323',
	'previous-contribution-340',
	'previous-contribution-348',
	'previous-contribution-352'
];

var previousCarryover = [
	'previous-carryover-309',
	'previous-carryover-310',
	'previous-carryover-321',
	'previous-carryover-322',
	'previous-carryover-323',
	'previous-carryover-340',
	'previous-carryover-348',
	'previous-carryover-352'
];

// This tables defines the order in which the forms are processed
// The number associated with the form is an index into arrays used for processing the forms
var processOrder = [
	[ 'Form-340', 5 ],
	[ 'Form-310', 1 ],
	[ 'Form-321', 2 ],
	[ 'Form-322', 3 ],
	[ 'Form-348', 6 ],
	[ 'Form-323', 4 ],
	[ 'Form-352', 7 ],
	[ 'Form-309', 0 ]
];

// This table defines the line numbers of the lines referenced in
// the first section " Form 301 For Previous Year" by the year of the
// Form 301
var lineRefArray = [
	[ '#line #',   2016, 2017, 2018, 2019, 2020, 2021 ], 
		// Current Year Credit lines -- 1st reference
	[ '#line-6a',  '6', '6', '5', '4', '3', '3' ],
		// Available Carryover lines -- 1st reference
	[ '#line-6b',  '6', '6', '5', '4', '3', '3' ],
		// Current Year Credit lines -- 2nd reference
	[ '#line-28a',  '32', '31', '28', '27', '25', '25' ],
		// Available Carryover lines -- 1st reference
	[ '#line-28b',  '32', '31', '28', '27', '25', '25' ],
		// Total available nonrefundable tax credits
	[ '#line-30',   '33', '33', '30', '29', '27', '26' ],
		// Tax Liability for Tax Credits
	[ '#line-39',   '43', '43', '39', '38', '34', '33' ],
		// Recaptured Credits lines -- 1st reference
	[ '#line-44',   '49', '49', '44', '42', '37', '36' ],
		// Recaptured Credits lines -- 2nd reference
	[ '#line-67',   '75', '74', '67', '65', '59', '57' ],
		// Total Tax Credits Used
	[ '#line-69',   '76', '76', '69', '67', '61', '61']
];

/* -----------------------------------------------------------------------------
** Function: toggleHidden
** Description: This function will show/hide (toggle) the select table type.
** Input:  "this" - Checkbox object.
----------------------------------------------------------------------------- */
function toggleHidden() {
	var idName = this.getAttributeNode('id').value;
	var indx = viewCtlForms.indexOf(idName);
	toggle(currentForms[indx], previousForms[indx], idName);
}

/* -----------------------------------------------------------------------------
 ** Function: toggle
 ** Description: This function sets/resets the "visible" class to allow
 **              the table to show/hide.
 ** Input: current   - Table ID of the current year table  element to be toggled.
 **        previous  - Table ID of the previous years table element to be toggled.
 **        idName    - ID of the checkbox element.
 **--------------------------------------------------------------------------- */
function toggle(current, previous, idName, forceView = false) {
	var currentTable = document.querySelector(current);
	var previousTable = document.querySelector(previous);
	var checkBox = document.querySelectorAll('#' + idName + ' input');

	if (currentTable.classList.contains('visible') && forceView === false) {
		checkBox.forEach(function(e) {
			e.checked = false;
		});
		currentTable.classList.remove('visible');
		previousTable.classList.remove('visible');
	} else {
		checkBox.forEach(function(e) {
			e.checked = true;
		});
		currentTable.classList.add('visible');
		previousTable.classList.add('visible');
	}
}

/* -----------------------------------------------------------------------------
 ** Function: updateYears
 ** Description: This function updates the years to years-5 for all tables
 ** Input: none
 **--------------------------------------------------------------------------- */
function updateYears() {
	var year = document.querySelector('#current-year').value;
	var node = document.querySelector('#previous-year');
	var remainingTaxTableHead = document.querySelector('#remaining-tax-table').tHead;
	var recapturedCreditsTableHead = document.querySelector('#recaptured-credits-table').tHead;

	node.innerHTML = year - 1;
	node = document.querySelector('#previous-year-301');
	node.innerHTML = year - 1;
	var previousYear = Number(node.innerHTML);

	// Update dates in the current & previous forms 321-352
	for (var i = 0; i < currentForms.length; i++) {
		updateFormDates(currentForms[i], year);
		updateFormDates(previousForms[i], year - 1);
	}

	for (var i = 0; i < 6; i++) {
		remainingTaxTableHead.rows[0].cells[i + 1].innerHTML = previousYear - 5 + i;
		recapturedCreditsTableHead.rows[0].cells[i + 1].innerHTML = previousYear - 5 + i;
	}

	updateLineReferences(year - 1);
}

/* -----------------------------------------------------------------------------
 ** Function: updateLineReferences
 ** Description: This function updates the line references in the first section
 **              'Form 301 For Previous Year' based on the year paseed as the
 **              parameter.
 ** Input: Year      - Current tax year
 **--------------------------------------------------------------------------- */
function updateLineReferences(year) {
	var i;
	var rows = lineRefArray.length;
	var lineID;
	var node;
	i = lineRefArray[0].indexOf(year);
	if (i <0) {
		i=lineRefArray[0].length - 1;
	}
	for (var j = 1; j < rows; j++) {
		lineID = lineRefArray[j][0];
		node = document.querySelector(lineID);
		node.innerHTML = lineRefArray[j][i];
	}
}

/* -----------------------------------------------------------------------------
 ** Function: updateFormDates
 ** Description: This function is called by "updateYears" for each table.
 **              This function does the work of altering the dates in the table.
 ** Input: tableId   - Table ID of the current year table  element
 **        Year      - Starting year
 **--------------------------------------------------------------------------- */
function updateFormDates(tableId, year) {
	// Get table object
	var table = document.querySelector(tableId).tBodies[0];
	var rowsCnt = table.rows.length;

	for (var i = 0; i < rowsCnt; i++) {
		table.rows[i].cells[0].innerHTML = year - (rowsCnt - i);
	}
}

/* -----------------------------------------------------------------------------
 ** Function: matrix (function of the Array object)
 ** Description: Initialize two dimentional array.
 ** Input: numrows   - Number of array rows.
 **        numcols   - Number of array columns.
 **        initial   - Initial value to initialize the array.
 **--------------------------------------------------------------------------- */
Array.matrix = function(numrows, numcols, initial) {
	var arr = [];
	for (var i = 0; i < numrows; ++i) {
		var columns = [];
		for (var j = 0; j < numcols; ++j) {
			columns[j] = initial;
		}
		arr[i] = columns;
	}
	return arr;
};

/* -----------------------------------------------------------------------------
 ** Function: calculateCarryover
 ** Description: For each form (310,...,352, and 301), this function calulates the
 **              values of the Available Carryover for the previous 5 years before
 **              the current year.
 ** Input: None.
 **        The functions uses the Form 301 and previous year Available Carryover
 **        as inputs.
 **--------------------------------------------------------------------------- */

function calculateCarryover() {
	// Enable print button
	document.querySelector('#print-tables').style.visibility = 'visible';

	var previousForm301 = document.querySelector('#previous-form-301').tBodies[0];
	//---------------------------------------------------------------------------------
	// These table provide training information
	//---------------------------------------------------------------------------------
	var remainingTaxTable = document.querySelector('#remaining-tax-table').tBodies[0];
	var recapturedCreditsTable = document.querySelector('#recaptured-credits-table').tBodies[0];

	// Number of years of carryover
	var creditYears = document.querySelector(previousForms[0]).tBodies[0].rows.length;
	//---------------------------------------------------------------------------------
	// The following two arrays have the dimension
	// Row: 		Number of forms with nonrefundable credit
	// Column:	Number of years of carryover + current year
	//---------------------------------------------------------------------------------
	// Remaining taxes after recapture
	var remainingTaxLiability = Array.matrix(currentForms.length, creditYears + 1, 0);
	// Recaptured credita for previous years
	var recapturedCreditsPreviousYears = Array.matrix(currentForms.length, creditYears + 1, 0);

	var previousTable;
	var currentTable;

	var taxRemaining = Number(document.querySelector('#tax-liability').value);

	// Total Credit per form -- Used in Form 301 to calculate available carryover
	var totalCredit = new Array(currentForms.length).fill(0);

	// Total Carryover previously used per form.
	// Used in Form 301 to calculate available carryover
	var totalUsed = new Array(currentForms.length).fill(0);

	// Total recaptured per form -- Used in Form 301, recaptured credits column
	var totalRecaptured = new Array(currentForms.length).fill(0);

	var credit, used; // Temp values for previous year being processed

	// Loop through all forms (310, 321, 322, 323, 348, and 352)
	// Var "i" is table index selection
	// Var "j" is table row selection
	var i = 0,
		j = 0,
		k = 0;

	//	if (dataValid() === false) {
		// alert("An error has been detected. Please correct and try again.");
	//	return;
	//	}

	//---------------------------------------------------------------------------------
	// Process Form 340 credit
	//---------------------------------------------------------------------------------
	i = processOrder[0][1]; // Forms index
	j = creditYears; // Years index
	credit = Number(previousForm301.rows[i].cells[2].childNodes[0].value);
	used = 0;

	// Recaptured credit table for training
	if (credit > 0) {
		recapturedCreditsPreviousYears[i][j] =
			credit - used > taxRemaining ? taxRemaining : credit - used;
	} else {
		recapturedCreditsPreviousYears[i][j] = 0;
	}
	// Remaining tax liability table for training
	remainingTaxLiability[i][j] = taxRemaining - recapturedCreditsPreviousYears[i][j];

	totalCredit[i] = 0;
	totalUsed[i] = 0;
	totalRecaptured[i] = recapturedCreditsPreviousYears[i][j];
	taxRemaining = remainingTaxLiability[i][j];
	// Cleanup code
	for (j = 0; j < creditYears; j++) {
		recapturedCreditsPreviousYears[i][j] = '';
		remainingTaxLiability[i][j] = '';
	}

	//---------------------------------------------------------------------------------
	// Process all forms that have carryover
	//---------------------------------------------------------------------------------
	for (j = 0; j <= creditYears; j++) {
		for (k = 1; k < processOrder.length - 1; k++) {
			i = processOrder[k][1];
			previousTable = document.querySelector(previousForms[i]).tBodies[0];
			currentTable = document.querySelector(currentForms[i]).tBodies[0];
			// Determine the amount of credit used
			switch (j) {
				case creditYears:
					// Process for previous year contribution
					credit = Number(previousForm301.rows[i].cells[2].childNodes[0].value);
					used = 0;
					break;
				default:
					credit = Number(previousTable.rows[j].cells[1].childNodes[0].value);
					used = Number(previousTable.rows[j].cells[2].childNodes[0].value);
			}

			// Recaptured credit table for training table
			if (credit > 0) {
				recapturedCreditsPreviousYears[i][j] =
					credit - used > taxRemaining ? taxRemaining : credit - used;
			} else {
				recapturedCreditsPreviousYears[i][j] = 0;
			}
			// Remaining tax liability for training table
			remainingTaxLiability[i][j] = taxRemaining - recapturedCreditsPreviousYears[i][j];

			totalCredit[i] += credit - used;
			totalUsed[i] = used;
			totalRecaptured[i] += recapturedCreditsPreviousYears[i][j];
			taxRemaining = remainingTaxLiability[i][j];
		}
	}

	//---------------------------------------------------------------------------------
	// Process Form 309 credit
	//---------------------------------------------------------------------------------
	i = processOrder[processOrder.length - 1][1]; // Forms index
	j = creditYears; // Years index
	credit = Number(previousForm301.rows[i].cells[2].childNodes[0].value);
	used = 0;

	// Recaptured credit table for training
	if (credit > 0) {
		recapturedCreditsPreviousYears[i][j] =
			credit - used > taxRemaining ? taxRemaining : credit - used;
	} else {
		recapturedCreditsPreviousYears[i][j] = 0;
	}
	// Remaining tax liability table for training
	remainingTaxLiability[i][j] = taxRemaining - recapturedCreditsPreviousYears[i][j];

	totalCredit[i] = 0;
	totalUsed[i] = 0;
	totalRecaptured[i] = recapturedCreditsPreviousYears[i][j];
	taxRemaining = remainingTaxLiability[i][j];
	// Cleanup code
	for (j = 0; j < creditYears; j++) {
		recapturedCreditsPreviousYears[i][j] = '';
		remainingTaxLiability[i][j] = '';
	}

	//---------------------------------------------------------------------------------
	// Populate the 'Available Carryover' and 'Recaptured Credits' columns in Form 301.
	//---------------------------------------------------------------------------------
	var summaryTable = document.querySelector('#summary').tBodies[0];
	var summaryCredits = 0;
	var summaryUsed = 0;
	for (i = 0; i < previousForm301.rows.length; i++) {
		if (carryoverAvailable[i][1] === true) {
			previousForm301.rows[i].cells[3].innerHTML =
				totalCredit[i] - Number(previousForm301.rows[i].cells[2].childNodes[0].value);
			summaryCredits +=
				Number(previousForm301.rows[i].cells[2].childNodes[0].value) +
				Number(previousForm301.rows[i].cells[3].innerHTML);
		} else {
			summaryCredits += Number(previousForm301.rows[i].cells[2].childNodes[0].value);
		}
		previousForm301.rows[i].cells[4].innerHTML = totalRecaptured[i];
		summaryUsed += totalUsed[i] + Number(previousForm301.rows[i].cells[4].innerHTML);
	}

	// Populate summary table
	summaryTable.rows[0].cells[2].innerHTML = summaryCredits;
	summaryTable.rows[1].cells[2].innerHTML = summaryUsed;

	//---------------------------------------------------------------------------------
	// Populate Available tables
	//---------------------------------------------------------------------------------
	for (i = 0; i < previousForms.length; i++) {
		previousTable = document.querySelector(previousForms[i]).tBodies[0];
		currentTable = document.querySelector(currentForms[i]).tBodies[0];

		if (totalCredit[i] > 0 && carryoverAvailable[i][1] === true) {
			toggle(currentForms[i], previousForms[i], viewCtlForms[i], (forceView = true));
		}
		// Populate Current Year Table
		for (j = 0; j < currentTable.rows.length - 1; j++) {
			currentTable.rows[j].cells[1].innerHTML = Number(
				previousTable.rows[j + 1].cells[1].childNodes[0].value
			);
			currentTable.rows[j].cells[2].innerHTML =
				Number(previousTable.rows[j + 1].cells[2].childNodes[0].value) +
				Number(recapturedCreditsPreviousYears[i][j + 1]);
		}

		currentTable.rows[j].cells[1].innerHTML = Number(
			previousForm301.rows[i].cells[2].childNodes[0].value
		);
		currentTable.rows[j].cells[2].innerHTML = recapturedCreditsPreviousYears[i][j + 1];
	}

	// Populate Training Aides tables
	for (k = 0; k < processOrder.length; k++) {
		i = processOrder[k][1];
		for (j = 0; j < 6; j++) {
			remainingTaxTable.rows[k].cells[0].innerHTML = processOrder[k][0];
			remainingTaxTable.rows[k].cells[j + 1].innerHTML = remainingTaxLiability[i][j];
			recapturedCreditsTable.rows[k].cells[0].innerHTML = processOrder[k][0];
			recapturedCreditsTable.rows[k].cells[j + 1].innerHTML =
				recapturedCreditsPreviousYears[i][j];
		}
	}
}

/* -----------------------------------------------------------------------------
 ** Function: displayAides
 ** Description: This function will show/hide (toggle) the training adie tables.
 ** Input:  nnne
 **--------------------------------------------------------------------------- */
function displayAides() {
	var button = document.querySelector('.training-tables');

	if (button.classList.contains('visible')) {
		button.classList.remove('visible');
	} else {
		button.classList.add('visible');
	}
}

/* -----------------------------------------------------------------------------
 ** Function: clearAll
 ** Description: Reset to initial state.
 ** Input:  nnne
 **--------------------------------------------------------------------------- */
function clearAll() {
	location.reload();
}

/* -----------------------------------------------------------------------------
 ** Function: syncScroll
 ** Description: Sync the scroll of the current or previous year information
 ** Input:  nnne
 **--------------------------------------------------------------------------- */
var isSyncingNow = false;
function syncScroll() {
	var SectionA = document.querySelector('#current-year-info');
	var SectionB = document.querySelector('#previous-year-info');
	var idName = this.getAttributeNode('id').value;
	if (isSyncingNow) {
		return;
	}

	isSyncingNow = true;
	if (idName == 'current-year-info') {
		SectionB.scrollTop = SectionA.scrollTop;
	} else {
		SectionA.scrollTop = SectionB.scrollTop;
	}
	isSyncingNow = false;
}
