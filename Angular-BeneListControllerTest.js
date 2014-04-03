/// <reference path="../../../Scripts/SharedReferences.js" />
/// <reference path="../BeneficiariesReferences.js" />

//'use strict';

describe("Beneficiaries List Controller->", function () {
  var scopeTest, dialogTest, rootScopeTest, ctrl;
  var fakeBene = {
    FirstName: "Jian",
    MiddleInitial: "",
    LastName: "Li",
    Suffix: "",
    BirthDate: "01/01/1970",
    Address: {
      Street1: "123 st",
      City: "qwe",
      State: "UT",
      PostalCode: "12345"
    },
    Relationship: 'Other',
    MaskedTaxId: "XXX-XX-1234",
    CorrelationId: "",
    PrimaryPercentage: 0,
    SeconaryPercentage: 0
  };

  var fakeDialog = {
    open: function () {
      return {
        then: function (callBack) {
          callBack({ bene: fakeBene });
        }
      };
    }
  };

  var fakeDialogWithReturn = function (result) {
    return {
      open: function () {
        return {
          then: function (callBack) {
            callBack(result);
          }
        };
      }
    };
  };
  
  beforeEach(function () {
    module('BeneApp');
    module('ui.bootstrap.dialog');
  });

  beforeEach(inject(function ($dialog, $rootScope, $controller) {
    dialogTest = $dialog;
    rootScopeTest = $rootScope;
    scopeTest = $rootScope.$new();
    ctrl = $controller('ListController', { $scope: scopeTest, $dialog: dialogTest, beneService: angular.copy(beneServiceTest) });
  }));

  it("Total Primary percentage is right", function () {
    var realResult = scopeTest.totalPrimary();
    expect(realResult).toBe(100);
  });

  it("Total Contingent percentage is right", function () {
    var realResult = scopeTest.totalContingent();
    expect(realResult).toBe(100);
  });

  it("Primary is valid whe total is 100 ", function () {
    var realResult = scopeTest.isPrimaryTotalValid();
    expect(realResult).toBe(true);
  });

  it("Primary is not valid whe total is 90 ", function () {
    scopeTest.beneficiaries[0].PrimaryPercentage = 90;
    var realResult = scopeTest.isPrimaryTotalValid();
    expect(realResult).toBe(false);
  });

  it("Primary is not valid whe total is 0 with ContingentTotal not 0", function () {
    scopeTest.beneficiaries[0].PrimaryPercentage = 0;
    var realResult = scopeTest.isPrimaryTotalValid();
    expect(realResult).toBe(false);
  });

  it("Contingent is valid whe total is 100 ", function () {
    var realResult = scopeTest.isContingentTotalValid();
    expect(realResult).toBe(true);
  });

  it("Total is valid when Primary & Contingent is valid", function () {
    var realResult = scopeTest.areTotalsValid();
    expect(realResult).toBe(true);
  });

  it("Total is not valid when Primary is not valid", function () {
    scopeTest.beneficiaries[0].PrimaryPercentage = 90;
    var realResult = scopeTest.areTotalsValid();
    expect(realResult).toBe(false);
  });

  it("Disable the Primary input when primary percentage =0 and contingent percentage !=0", function () {
    var bene = { PrimaryPercentage: 0, SeconaryPercentage: 10 };
    var realResult = scopeTest.disablePrimaryInput(bene);
    expect(realResult).toBe(true);
  });

  it("Enable the Primary input when primary percentage !=0", function () {
    var bene = { PrimaryPercentage: 100, SeconaryPercentage: 10 };
    var realResult = scopeTest.disablePrimaryInput(bene);
    expect(realResult).toBe(false);
  });

  it("Disable the Contingent input when contingent percentage =0 and primary percentage !=0", function () {
    var bene = { PrimaryPercentage: 10, SeconaryPercentage: 0 };
    var realResult = scopeTest.disableContingentInput(bene);
    expect(realResult).toBe(true);
  });

  it("Enable the Contingent input when contingent percentage !=0", function () {
    var bene = { PrimaryPercentage: 100, SeconaryPercentage: 10 };
    var realResult = scopeTest.disableContingentInput(bene);
    expect(realResult).toBe(false);
  });

  it("You can edit beneficiary in any time", function () {
    var bene = { PrimaryPercentage: 100, SeconaryPercentage: 10 };
    var realResult = scopeTest.canAddOrEditBeneficiaries(bene);
    expect(realResult).toBe(true);
  });

  it("You can add beneficiary in any time when current beneficiaries list is not bigger then 40", function () {
    var bene = { PrimaryPercentage: 0, SeconaryPercentage: 0 };
    var realResult = scopeTest.canAddOrEditBeneficiaries(bene);
    expect(realResult).toBe(true);
  });

  it("You cannot add beneficiary when current beneficiaries list is bigger then 40", function () {
    var bene = { PrimaryPercentage: 0, SeconaryPercentage: 0 };
    for (var i = 0; i < 40; i++) scopeTest.beneficiaries.push(bene);
    expect(scopeTest.beneficiaries.length > 40).toBe(true);
    var realResult = scopeTest.canAddOrEditBeneficiaries(null);
    expect(realResult).toBe(false);
    scopeTest.beneficiaries.splice(3, 40);
    expect(beneServiceTest.beneficiaryDesignation.Beneficiaries.length).toBe(3);
  });

  it("Add bene dialog box will add one beneficiary", function () {
    var origalList = angular.copy(scopeTest.beneficiaries);
    inject(function ($dialog) {
      spyOn($dialog, 'dialog').andReturn(fakeDialogWithReturn({ bene: fakeBene }));
    });
    scopeTest.editBeneDialog(null);
    expect(scopeTest.beneficiaries.length).toBe(origalList.length + 1);
  });

  it("Delete bene dialog box will delete the one beneficiary if user confirm to delete", function () {
    var bene = { PrimaryPercentage: 0, SeconaryPercentage: 0 };
    for (var i = 0; i < 2; i++) scopeTest.beneficiaries.push(bene);
    var originalCount = scopeTest.beneficiaries.length;

    inject(function ($dialog) {
      spyOn($dialog, 'dialog').andReturn(fakeDialogWithReturn({ confirm: true }));
    });
    scopeTest.deleteBeneficiary(scopeTest.beneficiaries[0]);
    expect(scopeTest.beneficiaries.length).toBe(originalCount - 1);
  });

  it("Delete bene dialog box will not delete the beneficiary if user confirm to cancel the delete", function () {
    var bene = { PrimaryPercentage: 0, SeconaryPercentage: 0 };
    for (var i = 0; i < 2; i++) scopeTest.beneficiaries.push(bene);
    var originalCount = scopeTest.beneficiaries.length;

    inject(function ($dialog) {
      spyOn($dialog, 'dialog').andReturn(fakeDialogWithReturn(null));
    });
    scopeTest.deleteBeneficiary(scopeTest.beneficiaries[0]);
    expect(scopeTest.beneficiaries.length).toBe(originalCount);
  });

});
