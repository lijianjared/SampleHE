/// <reference path="../../../Scripts/SharedReferences.js" />
/// <reference path="../BeneficiariesReferences.js" />

//'use strict';

describe("Beneficiaries EditBeneDialog Controller->", function () {
    var scopeTest, dialogTest, locationTest, rootScopeTest, ctrl;
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

    beforeEach(function () {
        module('BeneApp');
        module('ui.bootstrap.dialog');
        dialogCloseResult = "";
    });

    beforeEach(inject(function ($dialog, $rootScope, $controller) {
        dialogTest = {
            data: {
                bene:null,
                benes: angular.copy(beneServiceTest.beneficiaryDesignation.Beneficiaries)
            },
            close: function (result){ 
                if (result) {
                    dialogCloseResult = DialogCloseCalledWithValueReturn;
                } else {
                    dialogCloseResult = DialogCloseCalledWithoutValueReturn;
                }
            }
        };
        rootScopeTest = $rootScope;
        scopeTest = $rootScope.$new();
        ctrl = $controller('EditBeneDialogController', { $scope: scopeTest, dialog: dialogTest, beneService: angular.copy(beneServiceTest) });
    }));

    it("Beneficiary Signature String is right when no bene", function () {
        var realResult = scopeTest.beneficiarySignatureString(null);
        expect(realResult).toBe("");
    });

    it("Beneficiary Signature String is right when bene have value", function () {
        var sampleBene = {
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
        var expectResult = "JIANLIOTHER01/01/1970123STQWEUT1234511XXX-XX-1234FALSE";
        var realResult = scopeTest.beneficiarySignatureString(sampleBene);
        expect(realResult).toBe(expectResult);
    });

    it("Fake Beneficiary does not exist in current Bene list", function () {
        var realResult = scopeTest.isBeneExist(fakeBene);
        expect(realResult).toBe(false);
    });

    it("Fake beneficiary exist in current Bene list after add the fakeBene in the list", function () {
        dialogTest.data.benes.push(fakeBene);
        var realResult = scopeTest.isBeneExist(fakeBene);
        expect(realResult).toBe(true);
    });

    it("The Dialog title will be started with 'Add' when current bene is null", function () {
        var realResult = scopeTest.action;
        expect(realResult).toBe("Add");
    });

    it("Click Cancel button will close dialog without return value", function () {
        dialogCloseResult = "";
        scopeTest.cancel();
        expect(dialogCloseResult).toBe(DialogCloseCalledWithoutValueReturn);
    });

    it("Click OK button will close dialog with return value", function () {
        dialogCloseResult = "";
        scopeTest.ok(fakeBene);
        expect(dialogCloseResult).toBe(DialogCloseCalledWithValueReturn);
    });

    it("Spouse must be at least 10 years old", function () {
        var today = new Date();
        var sampleBene = {
            BirthDate: new Date(today.getFullYear() - 9, today.getMonth(), today.getDate()),
            Relationship: 'Spouse'
        };
        var realResult = scopeTest.isSpouseAndDateBad(sampleBene);
        expect(realResult).toBe(true);
    });

    it("Spouse bigger then 10 years old will not be consider as invalid", function () {
        var today = new Date();
        var sampleBene = {
            BirthDate: new Date(today.getFullYear() - 10, today.getMonth() > 1 ? today.getMonth() - 1 : 1, today.getDate() > 1 ? today.getDate()-1: 1),
            Relationship: 'Spouse'
        };
        var realResult = scopeTest.isSpouseAndDateBad(sampleBene);
        expect(realResult).toBe(false);
    });

    it("Child can be very small - no 10 years old limitation", function () {
        var today = new Date();
        var sampleBene = {
            BirthDate: new Date(today.getFullYear() - 9, today.getMonth(), today.getDate()),
            Relationship: 'Child'
        };
        var realResult = scopeTest.isSpouseAndDateBad(sampleBene);
        expect(realResult).toBe(false);
    });

});
