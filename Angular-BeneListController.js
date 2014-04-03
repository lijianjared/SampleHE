'use strict';

BeneApp.controller('ListController', ['$scope', '$dialog', 'beneService', '$filter',
    function ($scope, $dialog, beneService, $filter) {

      $scope.beneficiaryEdited = false;
      $scope.beneficiaries = beneService.beneficiaryDesignation.Beneficiaries || [];
      $scope.memberId = beneService.beneficiaryDesignation.MemberId;

      for (var j = 0; j < $scope.beneficiaries.length; j++) {
        var birthDate = $scope.beneficiaries[j].BirthDate;
        if (birthDate) {
          var date = $filter('date')($scope.beneficiaries[j].BirthDate, 'MM/dd/yyyy');
          $scope.beneficiaries[j].BirthDate = date;
        }
      }

      $scope.totalPrimary = function () {
        var total = 0;
        for (var i = 0; i < $scope.beneficiaries.length; i++) {
          var percentage = parseInt($scope.beneficiaries[i].PrimaryPercentage);
          if (percentage) {
            total += percentage;
          }
        }
        return total;
      };

      $scope.totalContingent = function () {
        var total = 0;
        for (var i = 0; i < $scope.beneficiaries.length; i++) {
          var percentage = parseInt($scope.beneficiaries[i].SeconaryPercentage);
          if (percentage) {
            total += percentage;
          }
        }
        return total;
      };

      $scope.isPrimaryTotalValid = function () {
        if ($scope.beneficiaries.length === 0)
          return true;

        return $scope.totalPrimary() === 100;
      };

      $scope.primaryIsZeroAndContingentIs100 = function () {
        return $scope.totalPrimary() === 0 && $scope.totalContingent() === 100;
      };

      $scope.isContingentTotalValid = function () {
        var total = $scope.totalContingent();
        return total === 0 || total === 100;
      };

      $scope.areTotalsValid = function () {
        return $scope.isPrimaryTotalValid() && $scope.isContingentTotalValid();
      };

      $scope.beneName = beneService.beneName;

      $scope.resolveHtmlPath = beneService.resolveHtmlPath;

      $scope.edit = function (bene) {
        if (bene.Relationship == "Trust") {
          $scope.editTrustDialog(bene);
          return;
        }
        $scope.editBeneDialog(bene);
      };

      $scope.canAddOrEditBeneficiaries = function (bene) {
        if ((bene == null) && ($scope.beneficiaries.length >= 40)) {
          alert("You cannot designate more than 40 beneficiaries.");
          return false;
        }
        return true;
      };

      $scope.editBeneDialog = function (bene) {
        if (!$scope.canAddOrEditBeneficiaries(bene)) return;
        var opts = {
          backdrop: true,
          keyboard: true,
          backdropClick: false,
          templateUrl: $scope.resolveHtmlPath('Dialogs/EditBeneDialog.html'),
          controller: 'EditBeneDialogController',
        };
        var d = $dialog.dialog(opts);
        d.data = {
          bene: bene,
          benes: $scope.beneficiaries,
          canBeSpouse: $scope.beneficiaryCanBeSpouse(bene),
          enteredTaxIds: $scope.getEnteredTaxIds(),
        };
        d.open().then(function (result) {
          if (result) {
            $scope.beneficiaryEdited = true;
            var modifiedBene = result.bene;
            if (modifiedBene.PrimaryPercentage == null) modifiedBene.PrimaryPercentage = 0;
            if (modifiedBene.SeconaryPercentage == null) modifiedBene.SeconaryPercentage = 0;
            if (bene != null) {
              var index = $scope.beneficiaries.indexOf(bene);
              if (index >= 0 && index < $scope.beneficiaries.length) {
                $scope.beneficiaries[index] = modifiedBene;
              } else {
                $scope.beneficiaries.push(modifiedBene);
              }
            } else {
              $scope.beneficiaries.push(modifiedBene);
            }
          }
        });
      };

      $scope.deleteBeneficiary = function (bene) {
        openDeleteDialog(bene);
      };

      var openDeleteDialog = function (bene) {
        var opts = {
          backdrop: true,
          keyboard: true,
          backdropClick: false,
          templateUrl: $scope.resolveHtmlPath('Dialogs/DeleteConfirmationDialog.html'),
          controller: 'DeleteConfirmationDialogController'
        };
        var d = $dialog.dialog(opts);
        d.data = {
          bene: bene
        };
        d.open().then(function (result) {
          if (result && result.confirm) {
            $scope.beneficiaryEdited = true;
            var index = $scope.beneficiaries.indexOf(bene);
            $scope.beneficiaries.splice(index, 1);
          }
        });
      };

      $scope.editTrustDialog = function (bene) {
        if (!$scope.canAddOrEditBeneficiaries(bene)) return;
        var opts = {
          backdrop: true,
          keyboard: true,
          backdropClick: false,
          templateUrl: $scope.resolveHtmlPath('Dialogs/EditTrustDialog.html'),
          controller: 'EditTrustDialogController',
        };
        var d = $dialog.dialog(opts);
        d.data = {
          bene: bene,
          benes: $scope.beneficiaries,
          enteredTaxIds: $scope.getEnteredTaxIds(),
        };
        d.open().then(function (result) {
          if (result) {
            $scope.beneficiaryEdited = true;
            var modifiedBene = result.bene;
            if (modifiedBene.PrimaryPercentage == null) modifiedBene.PrimaryPercentage = 0;
            if (modifiedBene.SeconaryPercentage == null) modifiedBene.SeconaryPercentage = 0;
            modifiedBene.Relationship = 'Trust';
            if (bene != null) {
              var index = $scope.beneficiaries.indexOf(bene);
              if (index >= 0 && index < $scope.beneficiaries.length) {
                $scope.beneficiaries[index] = modifiedBene;
              } else {
                $scope.beneficiaries.push(modifiedBene);
              }
            } else {
              $scope.beneficiaries.push(modifiedBene);
            }
          }
        });
      };

      $scope.save = function (beneficiaries) {
        beneService.saveBeneficiaries(beneficiaries).then(function () {
          beneService.redirectToMemberProfile();
        });
      };

      $scope.cancel = function () {
        beneService.redirectToMemberProfile();
      };

      $scope.disablePrimaryInput = function (bene) {
        if (bene.PrimaryPercentage > 0)
          return false; // If a value is already defined, don't disable this field
        if (bene.SeconaryPercentage > 0)
          return true;
        return false;
      };

      $scope.disableContingentInput = function (bene) {
        if (bene.SeconaryPercentage > 0)
          return false; // If a value is already defined, don't disable this field
        if (bene.PrimaryPercentage > 0)
          return true;
        return false;
      };

      $scope.countSpouseBeneficiaries = function () {
        var spouseCount = 0;
        for (var i = 0; i < $scope.beneficiaries.length; i++) {
          if ($scope.beneficiaries[i].Relationship === "Spouse") {
            spouseCount++;
          }
        }
        return spouseCount;
      };

      $scope.hasMoreThanOneSpouse = function () {
        return $scope.countSpouseBeneficiaries() > 1 ? true : false;
      };

      $scope.isInputInvalidForSave = function () {
        return !$scope.areTotalsValid() || $scope.hasMoreThanOneSpouse() || $scope.hasBeneficiariesWithDuplicateTaxId();
      };

      $scope.beneficiaryCanBeSpouse = function (beneficiary) {
        if ($scope.countSpouseBeneficiaries() === 0) {
          return true;
        } else if (beneficiary != null && beneficiary.Relationship === "Spouse") {
          return true;
        } else {
        return false;
        }
      };

      $scope.hasBeneficiariesWithDuplicateTaxId = function() {
        if ($scope.beneficiaries.length < 2) return false;

        var enteredTaxIds = $scope.getEnteredTaxIds(null).sort();

        for (var i = 0; i < enteredTaxIds.length - 1; i++) {
          if (enteredTaxIds[i + 1] === enteredTaxIds[i]) return true;
        }

        return false;
      };

      //relying on input validation to make sure they are valid tax ids.
      $scope.isEmptyOrMaskedTaxId = function(taxId) {
        if (!taxId && !(taxId === "")) return true; //no tax id to compare
        if (taxId.length > 0 && taxId.substring(0, 1) === "X") return true; //masked can't match
        return false;
      };

      // idToIgnore is used to exclude the tax id of a beneficiary being edited so that it won't falsely identify
      // as being a duplicate.
      $scope.getEnteredTaxIds = function (idToIgnore) {
        var hyphenFreeIdToIgnore = beneService.removeHyphens(idToIgnore);

        var retval = [];
        for (var i = 0; i < $scope.beneficiaries.length; i++) {
          var hyphenFreeTaxIdToCompare = beneService.removeHyphens($scope.beneficiaries[i].MaskedTaxId);

          if ($scope.isEmptyOrMaskedTaxId(hyphenFreeTaxIdToCompare)) continue;
          if (hyphenFreeIdToIgnore && hyphenFreeIdToIgnore === hyphenFreeTaxIdToCompare) continue;

          retval.push(hyphenFreeTaxIdToCompare);
        }
        return retval;
      };

      $scope.countSpouseBeneficiaries = function () {
        var spouseCount = 0;
        for (var i = 0; i < $scope.beneficiaries.length; i++) {
          if ($scope.beneficiaries[i].Relationship === "Spouse") {
            spouseCount++;
          }
        }
        return spouseCount;
      };

      $scope.hasMoreThanOneSpouse = function () {
        return $scope.countSpouseBeneficiaries() > 1 ? true : false;
      };

      $scope.isInputInvalidForSave = function () {
        return !$scope.areTotalsValid() || $scope.hasMoreThanOneSpouse();
      };

      $scope.beneficiaryCanBeSpouse = function (beneficiary) {
        if ($scope.countSpouseBeneficiaries() === 0) {
          return true;
        } else if (beneficiary != null && beneficiary.Relationship === "Spouse") {
          return true;
        } else {
          return false;
        }
      };
    }]
);
