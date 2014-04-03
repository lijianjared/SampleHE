'use strict';

BeneApp.controller('EditBeneDialogController', ['$scope', 'dialog', 'beneService',
    function ($scope, dialog, beneService) {

      $scope.bene = angular.copy(dialog.data.bene);
      $scope.canBeSpouse = dialog.data.canBeSpouse;
      $scope.enteredTaxIds = dialog.data.enteredTaxIds;
      $scope.states = angular.copy(beneService.states);
      if (!($scope.bene && $scope.bene.Address && $scope.bene.Address.State && $.trim($scope.bene.Address.State) !="")) {
        if ($scope.states[0]=="") {
          $scope.states.splice(0, 1);
        }
      }
      $scope.haveError = false;
      $scope.errorMessage = "";

      $scope.dateOptions = {
        changeYear: true,
        changeMonth: true,
        showOn: "button",
        yearRange: "1900:-00",
        maxDate: "+0d",
        minDate: new Date(1900, 0, 1, 1),
        dateFormat: 'mm/dd/yy',
        //constrainInput: true
      };

      $scope.action = $scope.bene ? "Edit" : "Add";

      $scope.ok = function (bene) {
        if ($scope.isBeneExist(bene)) {
          $scope.errorMessage = "This will create duplicated beneficiary which is not allowed.";
          $scope.haveError = true;
        } else if ($scope.isSpouseAndDateBad(bene)) {
            $scope.errorMessage = "Invalid spouse birth date.";
            $scope.haveError = true;
        } else if ($scope.isInvalidBeneficiaryRelationship(bene)) {
          $scope.errorMessage = "A spouse beneficiary was already added.";
          $scope.haveError = true;
        } else if ($scope.hasDuplicateTaxId(bene)) {
          $scope.errorMessage = "A beneficiary with this SSN was already entered.";
          $scope.haveError = true;
        } else {
          dialog.close({ bene: bene });
        }
      };

      $scope.cancel = function () {
        dialog.close();
      };

      $scope.isSpouseAndDateBad = function(bene) {
        if (bene === null) return false;
        if (!(bene.Relationship && (bene.Relationship.toUpperCase() === 'SPOUSE'))) return false;
        if (!bene.BirthDate || bene.BirthDate === '') return false;
        var today = new Date();
        var minBirthdate = new Date(today.getFullYear() - 10, today.getMonth(), today.getDate());
        var birthdate = new Date(bene.BirthDate);
        return (birthdate > minBirthdate);
      };

      $scope.isBeneExist = function (bene) {
        var benes = dialog.data.benes;
        if ((bene == null) || (benes == null)) return false;
        for (var i = 0; i < benes.length; i++) {
          if ($scope.beneficiarySignatureString(bene) == $scope.beneficiarySignatureString(benes[i])) {
            if ($scope.beneficiarySignatureString(bene) != $scope.beneficiarySignatureString(dialog.data.bene)) return true;
          }
        }
        return false;
      };

      $scope.beneficiarySignatureString = function (bene) {
        var result = '';
        if (bene == null) return result;
        result += (bene.FirstName == null ? '' : bene.FirstName.toUpperCase());
        result += (bene.MiddleName == null ? '' : bene.MiddleName.toUpperCase());
        result += (bene.LastName == null ? '' : bene.LastName.toUpperCase());
        result += (bene.Suffix == null ? '' : bene.Suffix.toUpperCase());
        result += (bene.Relationship == null ? '' : bene.Relationship.toUpperCase());
        result += (bene.BirthDate == null ? '' : bene.BirthDate.toString());
        if (bene.Address != null) {
          result += (bene.Address.Street1 == null ? '' : bene.Address.Street1.toUpperCase());
          result += (bene.Address.City == null ? '' : bene.Address.City.toUpperCase());
          result += (bene.Address.State == null ? '' : bene.Address.State.toUpperCase());
          result += (bene.Address.PostalCode == null ? '' : bene.Address.PostalCode.toUpperCase());
        }
        result += (bene.MaskedTaxId == null ? '0' : bene.MaskedTaxId.length);
        if (bene.MaskedTaxId != null) {
          result += (bene.MaskedTaxId.length >= 4 ? bene.MaskedTaxId : bene.MaskedTaxId.substring(bene.MaskedTaxId.length - 4, 4));
        }
        result += bene.IsAddressSameAsMember ? 'TRUE' : 'FALSE';
        return result.replace(' ', '');
      };

      $scope.isInvalidBeneficiaryRelationship = function (bene) {
        return bene.Relationship === 'Spouse' && !$scope.canBeSpouse;
      };

      $scope.hasDuplicateTaxId = function(bene) {
        var hyphenFreeTaxId = beneService.removeHyphens(bene.MaskedTaxId);
        return $scope.enteredTaxIds.indexOf(hyphenFreeTaxId) > -1;
      };
    }]
);
