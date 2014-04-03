BeneApp.directive('hePercentage', function () {
  var integerRegexp = /^\d*$/;

  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue) {
        var proposedViewValue = viewValue;
        var value = parseInt(viewValue);
        var valid = integerRegexp.test(viewValue);
        if (!valid) {
          viewValue = ctrl.$modelValue;
        } else {
          if (isNaN(value))
            viewValue = "0";

          if (value == null)
            viewValue = "0";

          if (value < 0)
            viewValue = "0";

          if (value > 100)
            viewValue = "100";

          if (viewValue && viewValue.length > 3)
            viewValue = viewValue.substring(viewValue.length - 3, viewValue.length);
        }

        if (viewValue !== proposedViewValue) {
          ctrl.$setViewValue(viewValue);
          ctrl.$render();
        }
        return viewValue;
      });
    }
  };
});

BeneApp.directive('heAlpha', function () {
  var alphaRegexp = /^[a-zA-Z\s'.-]*$/;
  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue) {
        var proposedViewValue = viewValue;
        if (!alphaRegexp.test(viewValue)) {
          viewValue = ctrl.$modelValue;
        }

        var valid = alphaRegexp.test(viewValue);
        ctrl.$setValidity('alpha', valid);
        if (viewValue !== proposedViewValue) {
          ctrl.$setViewValue(viewValue);
          ctrl.$render();
        }
        return viewValue;
      });
    }
  };
});

BeneApp.directive('hePostalCode', function () {
  var postalCodeRegexp = /^[0-9-]*$/;
  var numberRegexp = /^[0-9]*$/;
  var postalCode = /^(\d{5}-\d{4}|\d{5})$/;

  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      function newPostCode(viewValue) {
        var proposedViewValue = viewValue;
        var valid = postalCodeRegexp.test(viewValue) || viewValue.length == 0;
        if (!valid) {
          viewValue = ctrl.$modelValue;
        } else {
          var firstPart = viewValue.substring(0, 5);
          valid = numberRegexp.test(firstPart);

          if (!viewValue)
            viewValue = "";
          var stringLength = viewValue.length;
          if (valid && stringLength >= 6) {
            var restCharacter = viewValue.substring(5, stringLength);
            valid = numberRegexp.test(restCharacter);
            if (valid && (viewValue.indexOf('-') == -1)) {
              viewValue = viewValue.substring(0, 5) + "-" + restCharacter;
            }
          }

          if (viewValue.length > 10) {
            viewValue = viewValue.substring(0, 10);
          }
          if (viewValue.length > 0) {
            valid = postalCode.test(viewValue);
          }
        }

        ctrl.$setValidity('postalCode', valid);
        if (viewValue !== proposedViewValue) {
          ctrl.$setViewValue(viewValue);
          ctrl.$render();
        }
        return viewValue;
      };
      ctrl.$parsers.unshift(newPostCode);
      ctrl.$formatters.unshift(newPostCode);
    }
  };
});
BeneApp.directive('heSsn', function () {
  var ssnCharactersRegexp = /^[0-9X-]*$/;
  var ssn = /^(\d{3}-?\d{2}-?\d{4}|XXX-XX-\d{4})$/;

  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue) {
        var proposedViewValue = viewValue;
        var valid = ssnCharactersRegexp.test(viewValue);
        if (!valid) {
          viewValue = ctrl.$modelValue;
        }

        if (!viewValue)
          viewValue = "";
        var stringLength = viewValue.length;
        if (valid && stringLength == 4) {
          var forthCharacter = viewValue.substring(3, 4);
          valid = ssnCharactersRegexp.test(forthCharacter);
          if (valid && (forthCharacter !== '-')) {
            viewValue = viewValue.substring(0, 3) + "-" + forthCharacter;
          }
        }
        if (valid && stringLength == 7) {
          var seventhCharacter = viewValue.substring(6, 7);
          valid = ssnCharactersRegexp.test(seventhCharacter);
          if (valid && (seventhCharacter !== '-')) {
            viewValue = viewValue.substring(0, 6) + "-" + seventhCharacter;
          }
        }
        if (stringLength > 11) {
          viewValue = viewValue.substring(0, 11);
        }
        if (valid && stringLength == 11) {
          valid = ssn.test(viewValue);
        }
        if (valid && stringLength > 0 && stringLength < 11) {
          valid = false;
        }

        ctrl.$setValidity('ssn', valid);
        if (viewValue !== proposedViewValue) {
          ctrl.$setViewValue(viewValue);
          ctrl.$render();
        }
        return viewValue;
      });
    }
  };
});

BeneApp.directive('heTaxid', function () {
  var ssnCharactersRegexp = /^[0-9X-]*$/;
  var ssn = /^(\d{2}-?\d{7}|XX-XXX\d{4})$/;

  return {
    require: 'ngModel',
    link: function (scope, elm, attrs, ctrl) {
      ctrl.$parsers.unshift(function (viewValue) {
        var proposedViewValue = viewValue;
        var valid = ssnCharactersRegexp.test(viewValue);
        if (!valid) {
          viewValue = ctrl.$modelValue;
        }
        if (!viewValue)
          viewValue = "";
        var stringLength = viewValue.length;
        if (valid && stringLength == 3) {
          var thirdCharacter = viewValue.substring(2, 3);
          valid = ssnCharactersRegexp.test(thirdCharacter);
          if (valid && (thirdCharacter !== '-')) {
            viewValue = viewValue.substring(0, 2) + "-" + thirdCharacter;
          }
        }
        if (stringLength > 10) {
          viewValue = viewValue.substring(0, 10);
        }
        if (valid && stringLength == 10) {
          valid = ssn.test(viewValue);
        }
        if (valid && stringLength > 0 && stringLength < 10) {
          valid = false;
        }

        ctrl.$setValidity('taxid', valid);
        if (viewValue !== proposedViewValue) {
          ctrl.$setViewValue(viewValue);
          ctrl.$render();
        }
        return viewValue;
      });
    }
  };
});

BeneApp.directive('heMaxlength', function () {
  return {
    require: 'ngModel',
    link: function (scope, element, attrs, ngModelCtrl) {
      var maxlength = Number(attrs.heMaxlength);
      function fromUser(text) {
        if (!text)
          text = "";
        if (text.length > maxlength) {
          ngModelCtrl.$setValidity('maxlength', false);
        } else {
          ngModelCtrl.$setValidity('maxlength', true);
        }
        return text;
      }
      ngModelCtrl.$parsers.push(fromUser);
      ngModelCtrl.$formatters.push(fromUser);
    }
  };
});
