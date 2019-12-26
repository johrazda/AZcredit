"Strict Mode";
var donationLimit = [
  // The first value is the form number.
  // The
  [
    "Form 309",
    [2010, -1],
    [2011, -1],
    [2012, -1],
    [2013, -1],
    [2014, -1],
    [2015, -1],
    [2016, -1],
    [2017, -1],
    [2018, -1],
    [2019, -1],
    [2020, -1]
  ],
  [
    "Form 310",
    [2010, 1000],
    [2011, 1000],
    [2012, 1000],
    [2013, 1000],
    [2014, 1000],
    [2015, 1000],
    [2016, 1000],
    [2017, 1000],
    [2018, 1000],
    [2019, 1000],
    [2020, 1000]
  ],
  [
    "Form 321",
    [2010, 400],
    [2011, 400],
    [2012, 400],
    [2013, 800],
    [2014, 800],
    [2015, 800],
    [2016, 800],
    [2017, 800],
    [2018, 800],
    [2019, 800],
    [2020, 800]
  ],
  [
    "Form 322",
    [2010, 400],
    [2011, 400],
    [2012, 400],
    [2013, 400],
    [2014, 400],
    [2015, 400],
    [2016, 400],
    [2017, 400],
    [2018, 400],
    [2019, 400],
    [2020, 400]
  ],
  [
    "Form 323",
    [2010, 1000],
    [2011, 1000],
    [2012, 1006],
    [2013, 1034],
    [2014, 1056],
    [2015, 1070],
    [2016, 1090],
    [2017, 1092],
    [2018, 1110],
    [2019, 1138],
    [2020, 1186]
  ],
  [
    "Form 340",
    [2010, 400],
    [2011, 400],
    [2012, 400],
    [2013, 400],
    [2014, 400],
    [2015, 400],
    [2016, 400],
    [2017, 400],
    [2018, 400],
    [2019, 400],
    [2020, 400]
  ],
  [
    "Form 348",
    [2010, -100],
    [2011, -100],
    [2012, 1000],
    [2013, 1028],
    [2014, 1050],
    [2015, 1028],
    [2016, 1083],
    [2017, 1085],
    [2018, 1103],
    [2019, 1131],
    [2020, 1179]
  ],
  [
    "Form 352",
    [2010, -100],
    [2011, -100],
    [2012, -100],
    [2013, -100],
    [2014, -100],
    [2015, -100],
    [2016, 1000],
    [2017, 1000],
    [2018, 1000],
    [2019, 1000],
    [2020, 1000]
  ]
];

/* -----------------------------------------------------------------------------
 ** Function: findDonationLimit
 ** Description: Find the Limit for the  form type and year.
 ** Input: formIndex - The first index into the donationLimit array.
 **        yearIn    - Year in search of the second index into the donationLimit
 **                    array.
 **        The functions seacrhes the donationLimit for the index of the array
 **        with the year passed as an argument.
 ** Return: Limit of donation.
 ** Note: The limit assumes Married Filing Joint.
 **       A -1 value indicates no limit.
 **       A -100 means no limit defined (e.g. Form didn't exist for selected year).
 **       A -200 means no entry in table for given year.
 **--------------------------------------------------------------------------- */
function findDonationLimit(formIndex, yearIn) {
  for (var i = 1; i < donationLimit[formIndex].length; i++) {
    if (donationLimit[formIndex][i][0] === Number(yearIn)) {
      return Number(donationLimit[formIndex][i][1]);
    }
  }
  alert("The year (" + yearIn + ") for " + donationLimit[formIndex][0] + " doesn't exist.");
  return -200;
}

/* -----------------------------------------------------------------------------
 ** Function: dataValid
 ** Description: For each form (310,...,352, and 301), this function verfies
 **              the data is within the limits.
 ** Input: none
 ** Return: True is all data is good;
 **         False is a limit is exceeded
 **----------------------------------------------------------------------------- */
function dataValid() {
  var previousForm301 = document.querySelector("#previous-form-301").tBodies[0];
  var node = document.querySelector("#previous-year");
  var year = node.innerHTML;
  var limit;
  var i = 0,
    j = 0;

  // Validate data entered on form 301 (for forms 309,..., 352)
  for (i = 0; i < previousForm301.rows.length; i++) {
    var currentYearCredit;
    var form;
    // Find the limit within table
    // A negative limit indicates there is no limit
    limit = findDonationLimit(i, year);
    if (limit === -200) {
      return false;
    }

    currentYearCredit = Number(previousForm301.rows[i].cells[2].childNodes[0].value);
    form = previousForm301.rows[i].cells[1].innerHTML;

    if (Number.isNaN(currentYearCredit)) {
      alert(
        "The Current Year Credit for Form " +
          form +
          " in year (" +
          year +
          ") is Not a Number." +
          "\n\nPlease correct and try again."
      );
      return false;
    }

    if (limit > 0 && currentYearCredit > limit) {
      alert(
        "The Current Year Credit (" +
          currentYearCredit +
          ") for Form " +
          form +
          " in year (" +
          year +
          ") is greater then the maximum allowed limit (" +
          limit +
          ")." +
          "\n\nPlease correct and try again."
      );
      return false;
    }
  }

  for (i = 0; i < previousForms.length; i++) {
    var previousTable = document.querySelector(previousForms[i]).tBodies[0];
    var originalCreditAmount;
    var amountPreviouslyUsed;
    var form;

    // Process each entry (row) of selected table
    for (j = 0; j < previousTable.rows.length; j++) {
      year = previousTable.rows[j].cells[0].innerHTML;
      limit = findDonationLimit(i, year);
      if (limit === -200) {
        return false;
      }

      // Compare user's input with contribution limit
      originalCreditAmount = Number(previousTable.rows[j].cells[1].childNodes[0].value);
      amountPreviouslyUsed = Number(previousTable.rows[j].cells[2].childNodes[0].value);
      form = document.querySelector(previousForms[i]).tHead.rows[0].cells[0].innerHTML;
      if (Number.isNaN(originalCreditAmount) || Number.isNaN(amountPreviouslyUsed)) {
        alert(
          "The Original Credit Amount or Amount Previously Used for Form " +
            form +
            " in year (" +
            year +
            ") is Not a Number." +
            "\n\nPlease correct and try again."
        );
        return false;
      }

      if (limit > 0 && (originalCreditAmount > limit || amountPreviouslyUsed > limit)) {
        alert(
          "The Original Credit Amount (" +
            originalCreditAmount +
            ")  or Amount Previously Used (" +
            amountPreviouslyUsed +
            ") for Form " +
            form +
            " in year (" +
            year +
            ") is greater then the maximum allowed limit (" +
            limit +
            ")." +
            "\n\nPlease correct and try again."
        );
        return false;
      }

      if (amountPreviouslyUsed > originalCreditAmount) {
        alert(
          "The Original Credit Amount (" +
            originalCreditAmount +
            ") is less than  Amount Previously Used (" +
            amountPreviouslyUsed +
            ") for Form " +
            form +
            " in year (" +
            year +
            ")." +
            "\n\nPlease correct and try again."
        );
        return false;
      }
    }
  }
  return true;
}
