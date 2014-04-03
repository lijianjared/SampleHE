using System;
using HEWebsite.Areas.Member.Controllers;
using HSAInterfaces.Beneficiaries;

namespace HEWebsite.Areas.Member.Models
{
    public class BeneficiaryDesignationPresentationDto
    {
        public string MemberId { get; set; }
        public DateTime? DeathDate { get; set; }
        public AddressDto Address { get; set; }
        public BeneficiaryPresentationDto[] Beneficiaries { get; set; }
        public string BeneficiaryFormUrl { get; set; }
        public int BeneficiaryDesignationType { get; set; }
        public string DeclaredStateOfResidence { get; set; }
    }
  

  public class BeneficiaryPresentationDto
  {
    private const string SsnIdFormat = "XXX-XX-{0}";
    private const string TaxIdFormat = "XX-XXX{0}";

    public BeneficiaryPresentationDto()
    { }

    internal BeneficiaryPresentationDto(BeneficiaryDto dto, bool isPrimaryBeneficiary)
    {

      this.Address = dto.Address;
      this.IsAddressSameAsMember = dto.IsAddressSameAsMember;

      this.BirthDate = dto.BirthDate;
      this.FirstName = dto.FirstName;
      this.MiddleName = dto.MiddleInitial;
      this.LastName = dto.LastName;
      this.Suffix = dto.Suffix;

      this.Relationship = dto.Relationship.ToString();

      if(isPrimaryBeneficiary)
      {
        this.PrimaryPercentage = dto.AllocationPercentage;
        this.SeconaryPercentage = 0;
      }
      else
      {
        this.PrimaryPercentage = 0;
        this.SeconaryPercentage = dto.AllocationPercentage;
      }
      if (!string.IsNullOrEmpty(dto.MaskedTaxId))
      {
          this.MaskedTaxId = (!string.IsNullOrEmpty(this.Relationship) && this.Relationship.ToUpper() == "TRUST") ? String.Format(TaxIdFormat, dto.MaskedTaxId) : String.Format(SsnIdFormat, dto.MaskedTaxId);
      }
      else
      {
          this.MaskedTaxId = string.Empty;
      }
      this.CorrelationId = dto.CorrelationId; 
    }
    public string FirstName { get; set; }
    public string MiddleName { get; set; }
    public string LastName { get; set; }
    public string Suffix { get; set; }
    public DateTime? BirthDate { get; set; }
    public string MaskedTaxId { get; set; }
    public string CorrelationId { get; set; }
    public string Relationship { get; set; }
    public int PrimaryPercentage { get; set; }
    public int SeconaryPercentage { get; set; }
    public bool IsAddressSameAsMember { get; set; }

    public AddressDto Address { get; set; }
  }
}
