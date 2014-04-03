using System;
using System.Collections.Generic;
using System.Linq;
using System.Web.Mvc;
using HECommon.Authentication;
using HEServiceLayer.WCF;
using HEWebBase;
using HEWebsite.Areas.Member.Models;
using HSAInterfaces.Beneficiaries;
using Microsoft.Practices.Unity;
using Newtonsoft.Json;

namespace HEWebsite.Areas.Member.Controllers
{
  public class BeneficiariesController : MemberController
  {
    internal const string BeneficiaryFormUrl = "http://resources.healthequity.com/Forms/HE-BENEFICIARY-FORM-20110110.pdf";

    private readonly IMemberBeneficiaries _memberBeneficiaryServices;
    
    public BeneficiariesController(ICredentials credentials,
      [Dependency] WcfWrapperDi<IMemberBeneficiaries> memberBeneficiaryServices)
      : base(credentials)
    {
      _memberBeneficiaryServices = memberBeneficiaryServices.Proxy;
    }

    public ViewResult Index(MemberData memberData)
    {
      ViewBag.IsMemberServices = IsMemberServices;

      var designations = GetBeneficiaryDesignations(memberData.MemberId);
      var data = JsonConvert.SerializeObject(designations, new JsonSerializerSettings { DateFormatHandling = DateFormatHandling.IsoDateFormat});
      ViewBag.BeneficiaryDesignation = data;

      var designationHistory = IsMemberServices ? GetBeneficiaryDesignationHistory(memberData.MemberId): new BeneficiaryDesignationHistoryDto();
      var dataHistory = JsonConvert.SerializeObject(designationHistory, new JsonSerializerSettings { DateFormatHandling = DateFormatHandling.IsoDateFormat });
      ViewBag.BeneficiaryDesignationHistory = dataHistory;
      ViewBag.States = HECommon.Constants.States.ArrUsStates;
      return View();
    }

    [HttpPost]
    public void SaveBeneficiaryDesignationType(MemberData memberData, int beneficiaryDesignationType, string declaredStateOfResidence)
    {
      _memberBeneficiaryServices.SaveBeneficiaryDesignationType(memberData.MemberId, (BeneficiaryDesignationType)beneficiaryDesignationType, (declaredStateOfResidence  ?? ""));
    }

    [HttpPost]
    public void SaveBeneficiaryDesignations(MemberData memberData, BeneficiaryPresentationDto[] beneficiaries)
    {

      var primaryDtos = new List<BeneficiaryDto>();
      var contingentDtos = new List<BeneficiaryDto>();

      if (beneficiaries != null)
      {
        foreach(var b in beneficiaries.Where(b => (b.PrimaryPercentage + b.SeconaryPercentage) >= 0))
        {
          var dto = new BeneficiaryDto
            {
              Address = b.Address,
              IsAddressSameAsMember = b.IsAddressSameAsMember,
              BirthDate = b.BirthDate,
              FirstName = b.FirstName ?? string.Empty,
              MiddleInitial = b.MiddleName ?? string.Empty,
              LastName = b.LastName ?? string.Empty,
              Suffix = b.Suffix ?? string.Empty,
              Relationship = (Relationship) Enum.Parse(typeof (Relationship), b.Relationship),
              MaskedTaxId = b.MaskedTaxId ?? string.Empty
            };

          if(b.PrimaryPercentage > 0)
          {
            dto.AllocationPercentage = Convert.ToByte(b.PrimaryPercentage);
            primaryDtos.Add(dto);
          }
          else
          {
            dto.AllocationPercentage = Convert.ToByte(b.SeconaryPercentage);
            contingentDtos.Add(dto);
          }

          dto.CorrelationId = b.CorrelationId;
        }
      }
      var beneDesignationDto = new BeneficiaryDesignationsDto
        {
          MemberId = memberData.MemberId,
          PrimaryBeneficiaries = primaryDtos,
          ContingentBeneficiaries = contingentDtos
        };
      _memberBeneficiaryServices.SaveBeneficiaryDesignations(memberData.MemberId, beneDesignationDto);
    }


    internal BeneficiaryDesignationPresentationDto GetBeneficiaryDesignations(string memberId)
    {
      var dto = _memberBeneficiaryServices.GetBeneficiariesFor(memberId, true);

      var presentationDto = new BeneficiaryDesignationPresentationDto
        {
          MemberId = dto.MemberId,
          DeathDate = dto.DeathDate,
          DeclaredStateOfResidence = dto.DeclaredStateOfResidence,
          BeneficiaryFormUrl = BeneficiaryFormUrl,
          BeneficiaryDesignationType = (int) dto.BeneficiarySelection,
          Address = new AddressDto()
        };

      var beneficiaries = new List<BeneficiaryPresentationDto>();

      beneficiaries.AddRange(dto.PrimaryBeneficiaries.Select(b => new BeneficiaryPresentationDto(b, isPrimaryBeneficiary:true)));
      beneficiaries.AddRange(dto.ContingentBeneficiaries.Select(b => new BeneficiaryPresentationDto(b, isPrimaryBeneficiary: false)));

      presentationDto.Beneficiaries = beneficiaries.OrderByDescending(b => b.PrimaryPercentage)
        .ThenByDescending(b => b.SeconaryPercentage)
        .ToArray();

      return presentationDto;
    }

    internal BeneficiaryDesignationHistoryDto GetBeneficiaryDesignationHistory(string memberId)
    {
      var result = _memberBeneficiaryServices.GetBeneficiarieyHistoryFor(memberId);
      if (result != null)
      {
        foreach (var item in result.BeneficiaryDesignationHistory)
        {
          if (item.PrimaryBeneficiaries.Any())
          {
            item.PrimaryBeneficiaries = item.PrimaryBeneficiaries.OrderByDescending(b => b.Percentage).ToList();
          }
          if (item.ContingentBeneficiaries.Any())
          {
            item.ContingentBeneficiaries = item.ContingentBeneficiaries.OrderByDescending(b => b.Percentage).ToList();
          }
        }
      }
      return result;
    }
  }
}
