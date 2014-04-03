using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Web.Mvc;
using System.Web.Routing;
using HECommon.Authentication;
using HECommon.Client;
using HECommon.Utilities;
using HEServiceLayer.WCF;
using HEWebBase;
using HEWebsite.Areas.Member.Controllers;
using HEWebsite.Areas.Member.Models;
using HSAInterfaces.Beneficiaries;
using Microsoft.Practices.Unity;
using Moq;
using NUnit.Framework;

namespace HEWebsite.Tests.Controllers.Member
{
  [TestFixture]
  public class BeneficiariesControllerTests
  {
    private const string MemberId = "000078";

    private const string HealthEquity = "HealthEquity";
    private const string HealthEquityTester = "HealthEquityTester";
    private ICredentials _creds;
    private WcfWrapperDi<IMemberBeneficiaries> _serviceProxy;


    [SetUp]
    public virtual void SetUp()
    {
      ClientIoC.ReplaceContainer(new UnityContainer());
      InitCredentials();

    }


    [Test]
    public void Index_MemberWithBeneficiaryDesignations_ViewModelValid()
    {
      // Arrange controller
      var mockService = new Mock<IMemberBeneficiaries>();
      mockService.Setup(m => m.GetBeneficiariesFor(It.IsAny<string>(), It.IsAny<bool>())).Returns(BuildBeneficiaryDesignationsDto(MemberId));

      ClientIoC.Container.RegisterInstance(mockService.Object); // This Interface must be registered with the DI container because WcfWrapperDi<T> uses constructor injection to resolve it proxy class.
      _serviceProxy = new WcfWrapperDi<IMemberBeneficiaries>(mockService.Object);
      
      var target = new BeneficiariesController(_creds, _serviceProxy);

      // Arrange controller context
      var controllerContextMock = new Mock<ControllerContext>();
      controllerContextMock.SetupGet(c => c.HttpContext.User.Identity.Name).Returns("HealthEquityTester");
      controllerContextMock.SetupGet(c => c.HttpContext.User.Identity.IsAuthenticated).Returns(true);
      target.ControllerContext = controllerContextMock.Object;
      target.Url = new UrlHelper(new RequestContext(controllerContextMock.Object.HttpContext, new RouteData()), new RouteCollection());

      var memberData = new MemberData { MemberId = MemberId, EntityId = MemberId };

      // Act
      var result = target.Index(memberData);

      // Assert
      Assert.IsNotNull(result);
    }

    [Test]
    public void GetBeneficiaryDesignations_MemberWithBeneficiaryDesignations_ValidPresentationDto()
    {

      var expectedDto = BuildBeneficiaryDesignationsDto(MemberId);
      // Arrange controller
      var mockService = new Mock<IMemberBeneficiaries>();
      mockService.Setup(m => m.GetBeneficiariesFor(It.IsAny<string>(), It.IsAny<bool>())).Returns(expectedDto);

      ClientIoC.Container.RegisterInstance(mockService.Object); // This Interface must be registered with the DI container because WcfWrapperDi<T> uses constructor injection to resolve it proxy class.
      _serviceProxy = new WcfWrapperDi<IMemberBeneficiaries>(mockService.Object);
      
      var target = new BeneficiariesController(_creds, _serviceProxy);

      // Act
      var presentationDto = target.GetBeneficiaryDesignations(MemberId);

      // Assert
      Assert.That(presentationDto, Is.Not.Null);
      Assert.That(presentationDto.MemberId, Is.EqualTo(expectedDto.MemberId));
      Assert.That(presentationDto.DeclaredStateOfResidence, Is.EqualTo(expectedDto.DeclaredStateOfResidence));
      Assert.That(presentationDto.DeathDate, Is.EqualTo(expectedDto.DeathDate));
      Assert.That(presentationDto.Beneficiaries.Count(), Is.EqualTo(expectedDto.PrimaryBeneficiaries.Count() + expectedDto.ContingentBeneficiaries.Count()));

    }

    [Test]
    public void SaveBeneficiaryDesignations_WithPercentageAsZero_SaveAsContingentBeneficiary()
    {

      var expectedDto = BuildBeneficiaryDesignationsDto(MemberId);
      BeneficiaryDesignationsDto targetBeneficiaryDesignations = null ;
      // Arrange controller
      var mockService = new Mock<IMemberBeneficiaries>();
      mockService.Setup(m => m.SaveBeneficiaryDesignations(It.IsAny<string>(), It.IsAny<BeneficiaryDesignationsDto>()))
        .Callback<string, BeneficiaryDesignationsDto>((memberId, dto) => targetBeneficiaryDesignations = dto);


      ClientIoC.Container.RegisterInstance(mockService.Object);
        // This Interface must be registered with the DI container because WcfWrapperDi<T> uses constructor injection to resolve it proxy class.
      _serviceProxy = new WcfWrapperDi<IMemberBeneficiaries>(mockService.Object);


      var targetController = new BeneficiariesController(_creds, _serviceProxy);
      var memberData = new MemberData {MemberId = MemberId, EntityId = MemberId};

      var beneficiaries = new BeneficiaryPresentationDto[]
      {
        new BeneficiaryPresentationDto {FirstName = "Name 1", PrimaryPercentage = 100, SeconaryPercentage = 0, Relationship = "Child"},
        new BeneficiaryPresentationDto {FirstName = "Name 2", PrimaryPercentage = 0, SeconaryPercentage = 0, Relationship = "Child"},
      };

       targetController.SaveBeneficiaryDesignations(new MemberData()
       {
         EntityId = "entityId"
       }, beneficiaries );

      Assert.That(targetBeneficiaryDesignations.PrimaryBeneficiaries.Count(), Is.EqualTo(1));
      Assert.That(targetBeneficiaryDesignations.ContingentBeneficiaries.Count(), Is.EqualTo(1));
    }

    [Test]
    public void SaveBeneficiaryDesignations_WhenPercentageLargerThanZero_SaveBeneficiary()
    {

      var expectedDto = BuildBeneficiaryDesignationsDto(MemberId);
      BeneficiaryDesignationsDto targetBeneficiaryDesignations = null;
      // Arrange controller
      var mockService = new Mock<IMemberBeneficiaries>();
      mockService.Setup(m => m.SaveBeneficiaryDesignations(It.IsAny<string>(), It.IsAny<BeneficiaryDesignationsDto>()))
        .Callback<string, BeneficiaryDesignationsDto>((memberId, dto) => targetBeneficiaryDesignations = dto);


      ClientIoC.Container.RegisterInstance(mockService.Object);
      // This Interface must be registered with the DI container because WcfWrapperDi<T> uses constructor injection to resolve it proxy class.
      _serviceProxy = new WcfWrapperDi<IMemberBeneficiaries>(mockService.Object);


      var targetController = new BeneficiariesController(_creds, _serviceProxy);
      var memberData = new MemberData { MemberId = MemberId, EntityId = MemberId };

      var beneficiaries = new BeneficiaryPresentationDto[]
      {
        new BeneficiaryPresentationDto {FirstName = "Name 1", PrimaryPercentage = 100, SeconaryPercentage = 0, Relationship = "Child"},
        new BeneficiaryPresentationDto {FirstName = "Name 2", PrimaryPercentage = 0, SeconaryPercentage = 0, Relationship = "Child"},
      };

      targetController.SaveBeneficiaryDesignations(new MemberData()
      {
        EntityId = "entityId"
      }, beneficiaries);

      Assert.That(targetBeneficiaryDesignations.PrimaryBeneficiaries.Count(), Is.EqualTo(1));
      Assert.That(targetBeneficiaryDesignations.ContingentBeneficiaries.Count(), Is.EqualTo(1));
    }

    private void InitCredentials()
    {
      _creds = new Credentials();
      _creds.LoginId = "misc_DevelopmentTest";
      _creds.EntityId = HealthEquity;
      _creds.EntityType = HealthEquity;
      _creds.Username = HealthEquityTester;
      _creds.Roles = new[] { "Role4", "Role5", "Role6" };
      _creds.EncryptedPasswordHash = PasswordEncryption.Instance.EncryptPassword("testing");
    }


    private static BeneficiaryDesignationsDto BuildBeneficiaryDesignationsDto(string memberId)
    {
      var dto = new BeneficiaryDesignationsDto
      {
        MemberId = memberId,
        BeneficiarySelection = BeneficiaryDesignationType.MarriedSpouseIsPrimary,
        DeathDate = null,
        DeclaredStateOfResidence = String.Empty,
        //Address = new AddressDto
        //{
        //  Street1 = "741 E Litson",
        //  City = "Murray",
        //  State = "UT",
        //  PostalCode = "84107-2341"
        //},
        PrimaryBeneficiaries = new List<BeneficiaryDto>{
            new BeneficiaryDto
            {
              FirstName = "Marianne",
              MiddleInitial = "K",
              LastName = "Ruben", 
              AllocationPercentage = 100,
              Address = new AddressDto
              {
                Street1 = "741 E Litson",
                City = "Murray",
                State = "UT",
                PostalCode = "84107-2341"
              },
              Relationship =  Relationship.Spouse,
              MaskedTaxId = "1234"
            }
        },
        ContingentBeneficiaries = new List<BeneficiaryDto>
        {
          new BeneficiaryDto
            {
              FirstName = "Lisa",
              LastName = "Moore",
              Address = new AddressDto
              {
                Street1 = "7123 E Elm",
                City = "South Jordan",
                State = "UT",
                PostalCode = "84123"
              },
              AllocationPercentage = 34,
              Relationship = Relationship.Child
            },

            new BeneficiaryDto
            {
              FirstName = "Eric",
              LastName = "Ruben",
              Address = new AddressDto
              {
                Street1 = "7123 E Southern",
                City = "Marana",
                State = "AZ",
                PostalCode = "12345"
              },
              AllocationPercentage = 33,               
              Relationship = Relationship.Child
            },

            new BeneficiaryDto
            {
              FirstName = "Ruben Family Trust",
              AllocationPercentage = 33,
              Relationship = Relationship.Trust,
              MaskedTaxId = "4567"
            }
          }
      };
      return dto;
    }
  }
}
