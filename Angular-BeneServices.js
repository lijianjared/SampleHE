'use strict';

BeneApp.factory('beneService', ['$http', '$window', 'heSharedData', function ($http, $window, heSharedData) {
  var rootUrl = heSharedData.rootUrl;
  var baseUrl = rootUrl + 'Member/Beneficiaries';
  var htmlRootUrl = rootUrl + "Apps/Member/Beneficiaries/html/";

  var resolveRootPath = function (rootPath) {
    if (rootPath.length < 5)
      return "";
    var newPath = rootPath.replace(/\~\//, rootUrl); // Replace ~/ with the rootUrl
    return newPath;
  };

  return {
    beneficiaryDesignation: heNS.beneficiaryDesignation,
    beneficiaryDesignationHistory: heNS.beneficiaryDesignationHistory,
    states: heNS.states,
    isMemberServices: heSharedData.isMemberServices,
    resolveHtmlPath: function (htmlFileName) {
      return htmlRootUrl + htmlFileName;
    },
    resolveRootPath: resolveRootPath,
    saveBeneficiaryDesignationType: function (designationType, declaredStateOfResidence) {
      if (designationType != 3) {
        declaredStateOfResidence = "";
      }
      var postData = { beneficiaryDesignationType: (designationType == null ? 0 : designationType), declaredStateOfResidence: (declaredStateOfResidence == null ? '' : declaredStateOfResidence) };
      return $http.post(baseUrl + '/SaveBeneficiaryDesignationType', postData);
    },
    saveBeneficiaries: function (beneficiaries) {
      var postData = { beneficiaries: beneficiaries };
      return $http.post(baseUrl + '/SaveBeneficiaryDesignations', postData);
    },
    redirectToMemberProfile: function () {
      var newPath = resolveRootPath("~/Member/MemberProfile");
      $window.location.href = newPath;
    },
    beneName: function (bene) {
      var name = "";
      if (bene.FirstName && bene.FirstName.length > 0) {
        name += bene.FirstName;
      }
      if (bene.LastName && bene.LastName.length > 0) {
        name += " " + bene.LastName;
      }
      return name;
    },
    beneRelationshipName: function (relationTypeId) {
        switch (relationTypeId) {
            case 1:
                return 'Spouse';
            case 2:
                return 'Child';
            case 3:
                return 'Other';
            case 4:
                return 'Trust';
            default:
      }
      return '';
    },
    removeHyphens: function (str) {
      return str ? str.replace(/-/g, '') : str;
    }
  };
}]);
