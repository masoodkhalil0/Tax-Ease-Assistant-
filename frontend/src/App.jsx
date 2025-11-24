import React, { useState } from 'react';
import { ChevronRight, ChevronDown, Search, Save, FileText, Printer, X, User } from 'lucide-react';

export default function FBRIRISDemo() {
  const [activeTab, setActiveTab] = useState('data');
  const [activeSection, setActiveSection] = useState('employment');
  const [activeSubSection, setActiveSubSection] = useState('salary');
  const [expandedSections, setExpandedSections] = useState({
    employment: true,
    property: false,
    business: false,
    capitalGain: false,
    otherSources: false,
    foreignSources: false,
    taxChargeable: false,
    wealthStatement: false
  });

  const toggleSection = (section) => {
    setExpandedSections(prev => ({
      ...prev,
      [section]: !prev[section]
    }));
  };

  const handleSectionClick = (section, subSection = null) => {
    setActiveSection(section);
    if (subSection) {
      setActiveSubSection(subSection);
    }
    if (!expandedSections[section]) {
      toggleSection(section);
    }
  };

  // Employment - Salary Data
  const salaryFields = [
    { code: '1000', description: 'Income from Salary' },
    { code: '1009', description: 'Pay, Wages or Other Remuneration (including Arrears of Salary)' },
    { code: '1049', description: 'Allowances (including Flying / Submarine Allowance)' },
    { code: '1059', description: 'Expenditure Reimbursement' },
    { code: '1089', description: 'Value of Perquisites (including Transport Monetization for Government Servants)' },
    { code: '1099', description: 'Profits in Lieu of or in Addition to Pay, Wages or Other Remuneration (including Employment Termination Benefits)' }
  ];

  // Property - Receipts/Deductions Data
  const propertyFields = [
    { code: '2000', description: 'Income / (Loss) from Property' },
    { code: '2029', description: 'Total Receipts from Property' },
    { code: '2001', description: 'Rent Received or Receivable' },
    { code: '2002', description: '1/10th of Amount not Adjustable against Rent' },
    { code: '2003', description: 'Forfeited Deposit under a Contract for Sale of Property' },
    { code: '2004', description: 'Recovery of Unpaid Irrecoverable Rent allowed as deduction' },
    { code: '2005', description: 'Unpaid Liabilities exceeding three Years' },
    { code: '2099', description: 'Total Deductions from Property' },
    { code: '2031', description: '1/5th of Rent of Building for Repairs' },
    { code: '2032', description: 'Insurance Premium' },
    { code: '2033', description: 'Local Rate / Tax / Charge / Cess' },
    { code: '2034', description: 'Ground Rent' },
    { code: '2035', description: 'Profit on Capital borrowed for Investment in Property' },
    { code: '2036', description: 'Share in Rental Income Paid to HBFC / Banks' },
    { code: '2037', description: 'Rent Collection Expenditure' },
    { code: '2038', description: 'Legal Service Charges' },
    { code: '2039', description: 'Amount claimed as Irrecoverable Rent' },
    { code: '2097', description: 'Payment of Liabilities treated as Income' },
    { code: '2098', description: 'Other Deductions against Rent' }
  ];

  // Business Fields
  const businessManufacturingFields = [
    { code: '3000', description: 'Income / (Loss) from Business' },
    { code: '3029', description: 'Net Revenue (excluding Sales Tax, Federal Excise, Brokerage, Commission, Discount, Freight Outward)' },
    { code: '3009', description: 'Gross Revenue (excluding Sales Tax, Federal Excise)' },
    { code: '3019', description: 'Selling Expenses (Freight Outward, Brokerage, Commission, Discount, etc.)' },
    { code: '3030', description: 'Cost of Sales / Services' },
    { code: '3039', description: 'Opening Stock' },
    { code: '3059', description: 'Net Purchases (excluding Sales Tax, Federal Excise)' },
    { code: '3071', description: 'Salaries / Wages' },
    { code: '3072', description: 'Fuel' },
    { code: '3073', description: 'Power' },
    { code: '3074', description: 'Gas' },
    { code: '3076', description: 'Stores / Spares' },
    { code: '3077', description: 'Repair / Maintenance' },
    { code: '3083', description: 'Other Direct Expenses' },
    { code: '3087', description: 'Accounting Amortization' },
    { code: '3088', description: 'Accounting Depreciation' },
    { code: '3099', description: 'Closing Stock' },
    { code: '3100', description: 'Gross Profit / (Loss)' }
  ];

  const businessOtherRevenuesFields = [
    { code: '3129', description: 'Other Revenues' },
    { code: '3101', description: 'Fee for Technical / Professional Services' },
    { code: '3115', description: 'Accounting Gain on Sale of Intangibles' },
    { code: '3116', description: 'Accounting Gain on Sale of Assets' },
    { code: '3128', description: 'Others' },
    { code: '3131', description: 'Share in untaxed Income from AOP' },
    { code: '3123', description: 'Gain by builder/developer in excess of 10 times of tax liability under Rule 6 of Eleventh Schedule' },
    { code: '3141', description: 'Share in Taxed Income from AOP' }
  ];

  const businessManagementExpensesFields = [
    { code: '3199', description: 'Management, Administrative, Selling & Financial Expenses' },
    { code: '3151', description: 'Rent' },
    { code: '3152', description: 'Rates / Taxes / Cess' },
    { code: '3154', description: 'Salaries / Wages / Perquisites / Benefits' },
    { code: '3155', description: 'Traveling / Conveyance / Vehicles Running / Maintenance' },
    { code: '3158', description: 'Electricity / Water / Gas' },
    { code: '3162', description: 'Communication' },
    { code: '3165', description: 'Repair / Maintenance' },
    { code: '3166', description: 'Stationery / Printing / Photocopies / Office Supplies' },
    { code: '3168', description: 'Advertisement / Publicity / Promotion' },
    { code: '3170', description: 'Insurance' },
    { code: '3171', description: 'Professional Charges' },
    { code: '3172', description: 'Profit on Debt (Financial Charges / Markup / Interest)' },
    { code: '3174', description: 'Donation / Charity' },
    { code: '3178', description: 'Brokerage / Commission' },
    { code: '3180', description: 'Other Indirect Expenses' },
    { code: '3186', description: 'Irrecoverable Debts Written off' },
    { code: '3187', description: 'Obsolete Stocks / Stores / Spares / Fixed Assets Written off' },
    { code: '3195', description: 'Accounting (Loss) on Sale of Intangibles' },
    { code: '319501', description: 'Contribution to an Approved gratuity fund / Pension Fund / Superannuation Fund' },
    { code: '3196', description: 'Accounting (Loss) on Sale of Assets' },
    { code: '3197', description: 'Accounting Amortization' },
    { code: '3198', description: 'Accounting Depreciation' },
    { code: '3200', description: 'Accounting Profit / (Loss)' }
  ];

  const businessInadmissibleDeductionsFields = [
    { code: '3239', description: 'Inadmissible Deductions' },
    { code: '3201', description: 'Add Backs u/s 21(2) Provision for Doubtful Debts' },
    { code: '3202', description: 'Add Backs u/s 21(c) Provision for Obsolete Stocks / Stores / Spares / Fixed Assets' },
    { code: '3203', description: 'Add Backs u/s 21(f) Provision for Diminution in Value of Investment' },
    { code: '3204', description: 'Add Backs u/s 21(i) Reserves / Funds / Amount carried to Reserves or Capitalized' },
    { code: '3205', description: 'Add Backs u/s 21(g) Cess / Rate / Tax levied on Profits / Gains' },
    { code: '3206', description: 'Add Backs u/s 21(b) Amount of Tax Deducted at Source' },
    { code: '3207', description: 'Add Backs u/s 21(o) Payments liable to Deduction of Tax at Source but Tax not deducted / Paid' },
    { code: '3208', description: 'Add Backs u/s 21(p) Entertainment Expenditure above prescribed limit' },
    { code: '3209', description: 'Add Backs u/s 21(g) Contributions to Unrecognized / Unapproved Funds' },
    { code: '3210', description: 'Add Backs u/s 21(c) Contributions to Funds not under effective arrangement for deduction of Tax at source' },
    { code: '3211', description: 'Add Backs u/s 21(a) Fine / Penalty for violation of any law / rule / regulation' },
    { code: '3212', description: 'Add Backs u/s 21(j) Personal Expenditure' },
    { code: '3213', description: 'Add Backs u/s 21(j) Profit on Debt / Brokerage / Commission / salary / remuneration Paid by an AOP to its member' },
    { code: '3215', description: 'Add Backs u/s 21(l) Expenditure under a single Account head exceeding prescribed amount not paid through prescribed mode' },
    { code: '3216', description: 'Add Backs u/s 21(m) Salary exceeding prescribed amount not paid through prescribed mode' },
    { code: '3217', description: 'Add Backs u/s 21(r) Capital Expenditure' },
    { code: '3218', description: 'Add Backs u/s 67(1) Expenditure attributable to Non-Business Income' },
    { code: '3219', description: 'Add Backs u/s 36(3) Liabilities allowed Previously as deduction not Paid within three Years' },
    { code: '3220', description: 'Add Backs u/s 28(1)(a) Leave Rental not admissible' },
    { code: '3224', description: 'Add Backs u/s 21(o) Sales promotion, advertisement and publicity expenses of pharmaceutical manufacturers exceeding prescribed limit' },
    { code: '3225', description: 'Add Backs Tax Gain on Sale of Intangibles' },
    { code: '3226', description: 'Add Backs Tax Gain on Sale of Assets' },
    { code: '3228', description: 'Add Backs u/s 21(ga) Utility Bills exceeding prescribed amount not paid through high-speed mode' },
    { code: '322902', description: 'Add Backs u/s 21(cb) Expenditure attributable to sale to person required to be registered under Sales Tax but not registered' },
    { code: '322903', description: 'Add Backs u/s 21(g) Expenditure Attributable to sales for non-integration of Business with FBR system' },
    { code: '322905', description: 'Add Backs u/s 21(r) Expenditure Attributable to sales for non-integration of Business with FBR system' },
    { code: '322901', description: 'Add Backs u/s 28(1)(b) Leave Rental not admissible on account of cost of Passenger transport vehicle exceeding 2.5 Million Rupees' },
    { code: '3227', description: 'Add backs u/s 21(ca) Commission in excess of 0.5% of gross amount of supplies to a person not appearing in ATL in Third Schedule of Sales Tax supplied by a person appearing in ATL of Third Schedule of Sales Tax' },
    { code: '3229', description: 'Deduction on profit on debit inadmissible u/s 106A' },
    { code: '3230', description: 'Add Backs Pre-Commencement Expenditure / Deferred Cost' },
    { code: '3231', description: '7.5% of Sales Dealers of Products listed in the 3rd Sch to the Sales Tax Act, 1990 who are not Registered under the STA 1990 and not appearing in the 3rd Sch' },
    { code: '3234', description: 'Other Inadmissible Deductions' }
  ];

  const businessAdmissibleDeductionsFields = [
    { code: '3259', description: 'Admissible Deductions' },
    { code: '3245', description: 'Accounting Gain on Sale of Intangibles' },
    { code: '3246', description: 'Accounting Gain on Sale of Assets' },
    { code: '3247', description: 'Tax Amortization for Current Year' },
    { code: '3248', description: 'Tax Depreciation / Initial Allowance for Current Year' },
    { code: '3250', description: 'Pre-Commencement Expenditure / Deferred Cost' },
    { code: '3254', description: 'Other Admissible Deductions' },
    { code: '3255', description: 'Tax (Loss) on Sale of Intangibles' },
    { code: '3256', description: 'Tax (Loss) on Sale of Assets' },
    { code: '3257', description: 'Unabsorbed Tax Amortization for Previous Years' },
    { code: '3258', description: 'Unabsorbed Tax Depreciation for Previous Years' }
  ];

  const businessAdjustmentsFields = [
    { code: '3270', description: 'Income / (Loss) from Business before adjustment of Admissible Depreciation / Initial Allowance / Amortization for current / previous years' },
    { code: '327017', description: 'Unadjusted (Loss) from Business for 2017' },
    { code: '327018', description: 'Unadjusted (Loss) from Business for 2018' },
    { code: '327019', description: 'Unadjusted (Loss) from Business for 2019' },
    { code: '327020', description: 'Unadjusted (Loss) from Business for 2020' },
    { code: '327021', description: 'Unadjusted (Loss) from Business for 2021' },
    { code: '327022', description: 'Unadjusted (Loss) from Business for 2022' }
  ];

  const businessAssetsFields = [
    { code: '3349', description: 'Total Assets' },
    { code: '3301', description: 'Land' },
    { code: '3302', description: 'Building (all types)' },
    { code: '3303', description: 'Plant / Machinery / Equipment / Furniture (including fittings)' },
    { code: '3312', description: 'Advances / Deposits / Prepayments' },
    { code: '3315', description: 'Stocks / Stores / Spares' },
    { code: '3319', description: 'Cash / Cash Equivalents' },
    { code: '3348', description: 'Other Assets' },
    { code: '3399', description: 'Total Equity / Liabilities' },
    { code: '3352', description: 'Capital' },
    { code: '3371', description: 'Long Term Borrowings / Debt / Loan' },
    { code: '3384', description: 'Trade Creditors / Payables' },
    { code: '3398', description: 'Other Liabilities' }
  ];

  // Capital Gain Fields
  const capitalGainMainFields = [
    { code: '4000', description: 'Gains / (Loss) from Capital Assets' }
  ];

  const capitalGainLongTermFields = [
    { code: '4006', description: 'Consideration Received on Disposal of Securities held Long Term' },
    { code: '4016', description: 'Cost of Acquisition of Securities including Ancillary Expenses held Long Term' },
    { code: '4017', description: 'Net Gain / (Loss) on Securities held long term' }
  ];

  const capitalGainShortTermFields = [
    { code: '4026', description: 'Consideration Received on Disposal of Securities held Short Term' },
    { code: '4036', description: 'Cost of Acquisition of Securities including Ancillary Expenses held Short Term' },
    { code: '4037', description: 'Net Gain / (Loss) on Securities held Short Term' }
  ];

  // Other Sources Fields
  const otherSourcesFields = [
    { code: '5000', description: 'Income / (Loss) from Other Sources' },
    { code: '5029', description: 'Receipts from Other Sources' },
    { code: '5003041', description: 'Yield on Behbood Certificates / Pensioner\'s Benefit Account / Shuhada Family Benefit Account' },
    { code: '5002', description: 'Royalty' },
    { code: '500312', description: 'Profit on Debt (if amount u/s 7B exceeds 5 million)' },
    { code: '5016', description: 'Loan, Advance, Deposit or Gift received in Cash' },
    { code: '5028', description: 'Other Receipts' },
    { code: '5004', description: 'Ground Rent' },
    { code: '5005', description: 'Rent from sub lease of Land or Building' },
    { code: '5006', description: 'Rent from lease of Building with Plant and Machinery' },
    { code: '5007', description: 'Annuity / Pension' },
    { code: '5089', description: 'Deductions from Other Sources' },
    { code: '5088', description: 'Other Deductions' }
  ];

  // Foreign Sources Fields
  const foreignSourcesFields = [
    { code: '6000', description: 'Foreign Income' },
    { code: '6029', description: 'Foreign Property Income / (Loss)' },
    { code: '6039', description: 'Foreign Business Income / (Loss)' },
    { code: '6049', description: 'Foreign Capital Gains / (Loss)' },
    { code: '6059', description: 'Foreign Other Sources Income / (Loss)' },
    { code: '6011', description: 'Foreign Salary Income' }
  ];

  const agricultureFields = [
    { code: '6100', description: 'Agriculture Income' },
    { code: '9291', description: 'Agricultural Income Tax Paid to Province(s)' }
  ];

  // Tax Chargeable Fields
  const deductibleAllowancesFields = [
    { code: '9009', description: 'Deductible Allowances' },
    { code: '9001', description: 'Zakat u/s 60' },
    { code: '9002', description: 'Workers Welfare Fund u/s 60A' },
    { code: '9008', description: 'Educational Expenses u/s 60D' },
    { code: '900801', description: 'No. of Children for whom tuition fee is paid' }
  ];

  const taxChargeableMainFields = [
    { code: '920001', description: 'Income Tax on working Capital u/s 99A of Ninth Schedule' }
  ];

  const taxReductionsFields = [
    { code: '9309', description: 'Tax Reductions' },
    { code: '9302', description: 'Tax Reduction for Full Time Teacher / Researcher (Except teachers of medical professions who derive income from private medical practice)' },
    { code: '930101', description: 'Tax Reduction on Tax Charged on Behbood Certificates / Pensioner\'s Benefit Account in excess of applicable rate' },
    { code: '930701', description: 'Tax Reduction on Capital Gain on Immovable Property under clause (9A), Part III, Second Schedule for Ex-Servicemen and serving personnel of Armed Forces and ex-employees and serving personnel of Federal & Provincial Government @50%' },
    { code: '930702', description: 'Tax Reduction on Capital Gain on Immovable Property under clause (9A), Part III, Second Schedule for Ex-Servicemen and serving personnel of Armed Forces and ex-employees and serving personnel of Federal & Provincial Government @75%' }
  ];

  const taxCreditsFields = [
    { code: '9329', description: 'Tax Credits' },
    { code: '9311', description: 'Tax Credit for Charitable Donations u/s 61' },
    { code: '9313', description: 'Tax Credit for Contribution to Approved Pension Fund u/s 63' },
    { code: '9332', description: 'Tax credit u/s 64D for POS machine' },
    { code: '931901', description: 'Tax Credit for Certain Persons (Coal Mining Projects, Startups) u/s 65F' },
    { code: '931902', description: 'Investment Tax Credit for Specified industrial undertaking u/s 65G' },
    { code: '931903', description: 'Tax credit u/s 65G specified Industrial Undertakings' },
    { code: '9320', description: 'Tax Credit u/s 103' },
    { code: '9321', description: 'Tax Credit for Tax Paid on Share Income from AOP' },
    { code: '9323', description: 'Tax credit for Charitable Organizations u/s 100C' },
    { code: '9328', description: 'Surrender of Tax Credit on Investments in Shares disposed off before time limit' },
    { code: '9331', description: 'Tax Credit for Charitable Donations u/s 61 where the donation is made to associate' }
  ];

  const capitalAssetsFields = [
    { code: '7100', description: 'Agriculture Property excluding Farmhouse' },
    { code: '7101', description: 'Farmhouse' },
    { code: '7102', description: 'Residential Property' },
    { code: '7103', description: 'Commercial Property' },
    { code: '7104', description: 'Industrial Property' },
    { code: '7105', description: 'Any other immovable capital asset' },
    { code: '7106', description: 'Total Value of capital assets' },
    { code: '7107', description: 'Total value of capital assets taxable under section 7E' },
    { code: '7108', description: 'Deemed Income under section 7E' }
  ];

  const adjustableTaxFields = [
    { code: '640000', description: 'Adjustable Tax' },
    { code: '64010002', description: 'Import u/s 148 @1%' },
    { code: '64010004', description: 'Import u/s 148 @2%' },
    { code: '64010006', description: 'Import u/s 148 @3%' },
    { code: '64010008', description: 'Import u/s 148 @4%' },
    { code: '64010009', description: 'Import u/s 148 @4.5%' },
    { code: '64010011', description: 'Import u/s 148 @5.5%' },
    { code: '64010012', description: 'Import u/s 148 @6%' },
    { code: '64020004', description: 'Salary of Employees u/s 149' },
    { code: '64020005', description: 'Directorship Fee u/s 149(3)' },
    { code: '64024005', description: 'Profit on Debt u/s 151 @15%' }
  ];

  const computationsFields = [
    { code: '3131', description: 'Share in untaxed Income from AOP' },
    { code: '3141', description: 'Share in Taxed Income from AOP' },
    { code: '9000', description: 'Total Income' },
    { code: '9009', description: 'Deductible Allowances' },
    { code: '9100', description: 'Taxable Income' },
    { code: '9200', description: 'Tax Chargeable' },
    { code: '920000', description: 'Normal Income Tax' },
    { code: '920100', description: 'Final / Fixed / Minimum / Average / Relevant / Reduced Income Tax' },
    { code: '920900', description: 'WWF' },
    { code: '9309', description: 'Tax Reductions' },
    { code: '9329', description: 'Tax Credits' },
    { code: '9012', description: 'Turnover / Tax on Income of Cotton Ginners' },
    { code: '923152', description: 'Turnover / Tax Chargeable u/s 113 @0.25%' },
    { code: '923168', description: 'Turnover / Tax Chargeable u/s 113 @0.75%' },
    { code: '925206', description: 'Turnover / Tax Chargeable u/s 113 @ 0.50%' },
    { code: '923161', description: 'Turnover / Tax Chargeable u/s 113 @ 1.25%' },
    { code: '923193', description: 'Difference of Minimum Tax Chargeable on Electricity Bill u/s 235' },
    { code: '923194', description: 'Difference of Minimum Tax Chargeable u/s 113' },
    { code: '923183', description: 'Tax on Deemed Income u/s 7E @20% (01.5% of FMV)' },
    { code: '9231822', description: 'Tax on High Earning Persons u/s 4C' },
    { code: '923189', description: 'Difference of Minimum Tax Chargeable u/s 236C (2)(Proviso)' },
    { code: '923198', description: 'Adjustment of Minimum Tax Paid u/s 113 in earlier Year(s)' },
    { code: '923201', description: 'Difference of Minimum Tax Chargeable' },
    { code: '92101', description: 'Refund Adjustment of Other Year(s) against Demand of this Year' },
    { code: '9201', description: 'Withholding Income Tax' },
    { code: '9202', description: 'Advance Income Tax' },
    { code: '92025', description: 'Advance Tax Paid under 147 for Builders/Developers (100D)' },
    { code: '92022', description: 'Advance Income Tax u/s 147A' },
    { code: '9203', description: 'Admitted Income Tax' },
    { code: '9204', description: 'Demanded Income Tax' },
    { code: '9210', description: 'Refundable Income Tax' }
  ];

  // Wealth Statement Fields
  const personalExpensesFields = [
    { code: '7089', description: 'Personal Expenses' },
    { code: '7051', description: 'Rent' },
    { code: '7052', description: 'Rates / Taxes / Charge / Cess' },
    { code: '7055', description: 'Vehicle Running / Maintenence' },
    { code: '7056', description: 'Travelling' },
    { code: '7058', description: 'Electricity' },
    { code: '7059', description: 'Water' },
    { code: '7060', description: 'Gas' },
    { code: '7061', description: 'Telephone' },
    { code: '7066', description: 'Asset Insurance / Security' },
    { code: '7070', description: 'Medical' },
    { code: '7071', description: 'Educational' },
    { code: '7072', description: 'Club' },
    { code: '7073', description: 'Functions / Gatherings' },
    { code: '7076', description: 'Donation, Zakat, Annuity, Profit on Debt, Life Insurance Premium, etc.' },
    { code: '7087', description: 'Other Personal / Household Expenses' },
    { code: '7088', description: 'Contribution in Expenses by Family Members' }
  ];

  const personalAssetsFields = [
    { code: '7001', description: 'Agricultural Property' },
    { code: '7002', description: 'Commercial, Industrial, Residential Property (Non-Business)' },
    { code: '7003', description: 'Business Capital' },
    { code: '7004', description: 'Equipment (Non-Business)' },
    { code: '7005', description: 'Animal (Non-Business)' },
    { code: '7006', description: 'Investment (Non-Business) (Account / Annuity / Bond / Certificate / Debenture / Deposit / Fund / Instrument / Policy / Share / Stock / Unit, etc.)' },
    { code: '7007', description: 'Debt (Non-Business) (Advance / Debt / Deposit / Prepayment / Receivable / Security)' },
    { code: '7008', description: 'Motor Vehicle (Non-Business)' },
    { code: '7009', description: 'Precious Possession' },
    { code: '7010', description: 'Household Effect' },
    { code: '7011', description: 'Personal Item' },
    { code: '7012', description: 'Cash (Non-Business)' },
    { code: '7013', description: 'Any Other Asset' },
    { code: '7014', description: 'Assets in Others\' Name' },
    { code: '7015', description: 'Total Assets inside Pakistan' },
    { code: '7016', description: 'Assets held outside Pakistan' },
    { code: '7018', description: 'Capital or voting rights in foreign company' },
    { code: '7020', description: 'Total Assets held outside pakistan' },
    { code: '7019', description: 'Total Assets' },
    { code: '7021', description: 'Credit (Non-Business) (Advance / Borrowing / Credit / Deposit / Loan / Mortgage / Overdraft / Payable)' },
    { code: '7029', description: 'Total Liabilities' },
    { code: '703001', description: 'Net Assets Current Year' }
  ];

  const reconciliationNetAssetsFields = [
    { code: '703001', description: 'Net Assets Current Year' },
    { code: '703002', description: 'Net Assets Previous Year' },
    { code: '703003', description: 'Increase / Decrease in Assets' },
    { code: '7049', description: 'Inflows' },
    { code: '7031', description: 'Income Declared as per Return for the year subject to Normal Tax' },
    { code: '7032', description: 'Income Declared as per Return for the year Exempt from Tax' },
    { code: '7033', description: 'Income Attributable to Receipts, etc. Declared as per Return for the year subject to Final / Fixed Tax' },
    { code: '7034', description: 'Adjustments in Inflows' },
    { code: '7035', description: 'Foreign Remittance' },
    { code: '7036', description: 'Inheritance' },
    { code: '7037', description: 'Gift' },
    { code: '7038', description: 'Gain on Disposal of Assets, excluding Capital Gain on Immovable Property' },
    { code: '7039', description: 'Income Attributable to Receipts (Builders/Developers)' },
    { code: '7048', description: 'Others' },
    { code: '7099', description: 'Outflows' },
    { code: '7089', description: 'Personal Expenses' },
    { code: '7098', description: 'Adjustments in Outflows' },
    { code: '7091', description: 'Gift' },
    { code: '7092', description: 'Loss on Disposal of Assets' },
    { code: '703000', description: 'Unreconciled Amount' },
    { code: '703004', description: 'Assets Transferred / Sold / Gifted / Donated during the year' }
  ];

  const renderFields = () => {
    let fieldsToRender = [];
    let hasMultipleColumns = true;
    let columnHeaders = ['Description', 'Code', 'Total Amount', 'Amount Exempt from Tax / Subject to Fixed / Final Tax', 'Amount Subject to Normal Tax'];

    if (activeSection === 'employment' && activeSubSection === 'salary') {
      fieldsToRender = salaryFields;
    } else if (activeSection === 'property' && activeSubSection === 'receiptsDeductions') {
      fieldsToRender = propertyFields;
    } else if (activeSection === 'business' && activeSubSection === 'manufacturing') {
      fieldsToRender = businessManufacturingFields;
    } else if (activeSection === 'business' && activeSubSection === 'otherRevenues') {
      fieldsToRender = businessOtherRevenuesFields;
    } else if (activeSection === 'business' && activeSubSection === 'managementExpenses') {
      fieldsToRender = businessManagementExpensesFields;
    } else if (activeSection === 'business' && activeSubSection === 'inadmissibleDeductions') {
      fieldsToRender = businessInadmissibleDeductionsFields;
    } else if (activeSection === 'business' && activeSubSection === 'admissibleDeductions') {
      fieldsToRender = businessAdmissibleDeductionsFields;
    } else if (activeSection === 'business' && activeSubSection === 'adjustments') {
      fieldsToRender = businessAdjustmentsFields;
    } else if (activeSection === 'business' && activeSubSection === 'businessAssets') {
      fieldsToRender = businessAssetsFields;
      columnHeaders = ['Description', 'Code', 'Amount'];
      hasMultipleColumns = false;
    } else if (activeSection === 'capitalGain' && activeSubSection === 'capitalGains') {
      fieldsToRender = capitalGainMainFields;
    } else if (activeSection === 'capitalGain' && activeSubSection === 'longTerm') {
      fieldsToRender = capitalGainLongTermFields;
    } else if (activeSection === 'capitalGain' && activeSubSection === 'shortTerm') {
      fieldsToRender = capitalGainShortTermFields;
    } else if (activeSection === 'otherSources' && activeSubSection === 'receiptsDeductions') {
      fieldsToRender = otherSourcesFields;
    } else if (activeSection === 'foreignSources' && activeSubSection === 'foreignSources') {
      fieldsToRender = foreignSourcesFields;
    } else if (activeSection === 'foreignSources' && activeSubSection === 'agriculture') {
      fieldsToRender = agricultureFields;
    } else if (activeSection === 'taxChargeable' && activeSubSection === 'deductibleAllowances') {
      fieldsToRender = deductibleAllowancesFields;
      columnHeaders = ['Description', 'Code', 'Total', 'Inadmissible', 'Admissible'];
    } else if (activeSection === 'taxChargeable' && activeSubSection === 'taxChargeable') {
      fieldsToRender = taxChargeableMainFields;
      columnHeaders = ['Description', 'Code', 'Amount'];
      hasMultipleColumns = false;
    } else if (activeSection === 'taxChargeable' && activeSubSection === 'taxReductions') {
      fieldsToRender = taxReductionsFields;
      columnHeaders = ['Description', 'Code', 'Total Amount', 'Tax Chargeable', 'Tax Reducted'];
    } else if (activeSection === 'taxChargeable' && activeSubSection === 'taxCredits') {
      fieldsToRender = taxCreditsFields;
      columnHeaders = ['Description', 'Code', 'Eligible Amount', 'Ineligible Amount', 'Tax Credit'];
    } else if (activeSection === 'taxChargeable' && activeSubSection === 'capitalAssets') {
      fieldsToRender = capitalAssetsFields;
      columnHeaders = ['Description', 'Code', 'Cost / Declared Value', 'Fair Market Value'];
    } else if (activeSection === 'taxChargeable' && activeSubSection === 'adjustableTax') {
      fieldsToRender = adjustableTaxFields;
      columnHeaders = ['Description', 'Code', 'Receipts / Value', 'Tax Collected / Deducted', 'Tax Chargeable'];
    } else if (activeSection === 'taxChargeable' && activeSubSection === 'computations') {
      fieldsToRender = computationsFields;
      columnHeaders = ['Description', 'Code', 'Total Amount', 'Amount Exempt from Tax / Subject to Fixed / Final Tax', 'Amount Subject to Normal Tax'];
    } else if (activeSection === 'wealthStatement' && activeSubSection === 'personalExpenses') {
      fieldsToRender = personalExpensesFields;
      columnHeaders = ['Description', 'Code', 'Amount'];
      hasMultipleColumns = false;
    } else if (activeSection === 'wealthStatement' && activeSubSection === 'personalAssets') {
      fieldsToRender = personalAssetsFields;
      columnHeaders = ['Description', 'Code', 'Amount'];
      hasMultipleColumns = false;
    } else if (activeSection === 'wealthStatement' && activeSubSection === 'reconciliation') {
      fieldsToRender = reconciliationNetAssetsFields;
      columnHeaders = ['Description', 'Code', 'Amount'];
      hasMultipleColumns = false;
    }

    return (
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-slate-700 text-white">
              <th className="px-4 py-3 text-left font-semibold">{columnHeaders[0]}</th>
              <th className="px-4 py-3 text-left font-semibold w-32">{columnHeaders[1]}</th>
              {hasMultipleColumns ? (
                <>
                  <th className="px-4 py-3 text-left font-semibold w-40">{columnHeaders[2]}</th>
                  <th className="px-4 py-3 text-left font-semibold w-48">{columnHeaders[3]}</th>
                  <th className="px-4 py-3 text-left font-semibold w-40">{columnHeaders[4]}</th>
                </>
              ) : (
                <>
                  <th className="px-4 py-3 text-left font-semibold w-40">{columnHeaders[2]}</th>
                  {columnHeaders[3] && <th className="px-4 py-3 text-left font-semibold w-40">{columnHeaders[3]}</th>}
                </>
              )}
            </tr>
          </thead>
          <tbody>
            {fieldsToRender.map((field, index) => {
              const isBold = field.code.length === 4 || ['2029', '2099', '3029', '3100', '3129', '3199', '3200', '3239', '3259', '3270', '3349', '3399', '4017', '4037', '5029', '5089', '9009', '9309', '9329', '7089', '7015', '7020', '7019', '7029', '703001', '7049', '7099', '703000'].includes(field.code);
              const bgColor = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';
              
              return (
                <tr key={field.code} className={`${bgColor} border-b border-gray-200 hover:bg-blue-50`}>
                  <td className={`px-4 py-3 ${isBold ? 'font-semibold' : ''}`}>
                    {field.description}
                  </td>
                  <td className="px-4 py-3 text-gray-700">
                    {field.code}
                  </td>
                  <td className="px-4 py-3">
                    <input
                      type="text"
                      id={`field_${field.code}_total`}
                      className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </td>
                  {hasMultipleColumns ? (
                    <>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          id={`field_${field.code}_exempt`}
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          id={`field_${field.code}_normal`}
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    </>
                  ) : (
                    columnHeaders[3] && (
                      <td className="px-4 py-3">
                        <input
                          type="text"
                          id={`field_${field.code}_additional`}
                          className="w-full px-3 py-1 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </td>
                    )
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Top Navigation Bar */}
      <nav className="bg-slate-800 text-white px-4 py-2 shadow-lg">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="text-xl font-bold text-purple-400">IRIS</div>
            <span className="text-sm text-gray-300">Demo Portal</span>
          </div>
          <div className="flex items-center space-x-2">
            <button className="px-3 py-1 text-sm hover:bg-slate-700 rounded">MIS</button>
            <button className="px-3 py-1 text-sm hover:bg-slate-700 rounded">Invoice Management</button>
            <button className="px-3 py-1 text-sm hover:bg-slate-700 rounded">IRMS</button>
            <button className="px-3 py-1 text-sm hover:bg-slate-700 rounded">Registration</button>
            <button className="px-3 py-1 text-sm hover:bg-slate-700 rounded">Declaration</button>
            <User className="w-6 h-6 ml-4" />
          </div>
        </div>
      </nav>

      {/* Header Section */}
      <div className="bg-white border-b shadow-sm">
        <div className="px-6 py-4">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h1 className="text-xl font-semibold text-gray-800">Year 2023</h1>
              <p className="text-sm text-gray-600">📋 114(1) (Return of Income filed voluntarily for complete year)</p>
            </div>
            <div className="flex items-center space-x-3">
              <button className="flex items-center space-x-2 px-4 py-2 text-red-600 hover:bg-red-50 rounded">
                <Save className="w-4 h-4" />
                <span>Save</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                <FileText className="w-4 h-4" />
                <span>Submit</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                <Printer className="w-4 h-4" />
                <span>Print</span>
              </button>
              <button className="flex items-center space-x-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded">
                <X className="w-4 h-4" />
                <span>Close</span>
              </button>
            </div>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-center mb-4">
            <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center text-white">
              ✓
            </div>
          </div>

          {/* Tabs */}
          <div className="flex space-x-2 border-b">
            <button
              onClick={() => setActiveTab('data')}
              className={`px-6 py-3 font-medium ${activeTab === 'data' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-t`}
            >
              Data
            </button>
            <button
              onClick={() => setActiveTab('amortization')}
              className={`px-6 py-3 font-medium ${activeTab === 'amortization' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-t`}
            >
              Amortization
            </button>
            <button
              onClick={() => setActiveTab('depreciation')}
              className={`px-6 py-3 font-medium ${activeTab === 'depreciation' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-t`}
            >
              Depreciation
            </button>
            <button
              onClick={() => setActiveTab('minimumTax')}
              className={`px-6 py-3 font-medium ${activeTab === 'minimumTax' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-t`}
            >
              Minimum Tax
            </button>
            <button
              onClick={() => setActiveTab('optionPTR')}
              className={`px-6 py-3 font-medium ${activeTab === 'optionPTR' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-t`}
            >
              Option out of PTR
            </button>
            <button
              onClick={() => setActiveTab('payment')}
              className={`px-6 py-3 font-medium ${activeTab === 'payment' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-t`}
            >
              Payment
            </button>
            <button
              onClick={() => setActiveTab('companyDirector')}
              className={`px-6 py-3 font-medium ${activeTab === 'companyDirector' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-t`}
            >
              Company Director
            </button>
            <button
              onClick={() => setActiveTab('attachment')}
              className={`px-6 py-3 font-medium ${activeTab === 'attachment' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-t`}
            >
              Attachment
            </button>
            <button
              onClick={() => setActiveTab('attribute')}
              className={`px-6 py-3 font-medium ${activeTab === 'attribute' ? 'bg-purple-600 text-white' : 'text-gray-600 hover:bg-gray-100'} rounded-t`}
            >
              Attribute
            </button>
            <div className="ml-auto flex space-x-2">
              <button className="px-3 py-2 bg-purple-600 text-white text-sm rounded">EN</button>
              <button className="px-3 py-2 text-gray-600 text-sm rounded hover:bg-gray-100">اردو</button>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="flex">
        {/* Sidebar */}
        <aside className="w-64 bg-white border-r min-h-screen p-4">
          {/* Employment Section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('employment')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-700">Employment</span>
              {expandedSections.employment ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.employment && (
              <div className="ml-4 mt-1">
                <button
                  onClick={() => handleSectionClick('employment', 'salary')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'employment' && activeSubSection === 'salary' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Salary
                </button>
              </div>
            )}
          </div>

          {/* Property Section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('property')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-700">Property</span>
              {expandedSections.property ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.property && (
              <div className="ml-4 mt-1">
                <button
                  onClick={() => handleSectionClick('property', 'receiptsDeductions')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'property' && activeSubSection === 'receiptsDeductions' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Receipts / Deductions
                </button>
              </div>
            )}
          </div>

          {/* Business Section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('business')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-700">Business</span>
              {expandedSections.business ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.business && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  onClick={() => handleSectionClick('business', 'manufacturing')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'business' && activeSubSection === 'manufacturing' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Manufacturing / Trading Items
                </button>
                <button
                  onClick={() => handleSectionClick('business', 'otherRevenues')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'business' && activeSubSection === 'otherRevenues' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Other Revenues
                </button>
                <button
                  onClick={() => handleSectionClick('business', 'managementExpenses')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'business' && activeSubSection === 'managementExpenses' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Management, Administrative, Selling & Financial Expenses
                </button>
                <button
                  onClick={() => handleSectionClick('business', 'inadmissibleDeductions')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'business' && activeSubSection === 'inadmissibleDeductions' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Inadmissible / Admissible Deductions
                </button>
                <button
                  onClick={() => handleSectionClick('business', 'adjustments')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'business' && activeSubSection === 'adjustments' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Adjustments
                </button>
                <button
                  onClick={() => handleSectionClick('business', 'businessAssets')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'business' && activeSubSection === 'businessAssets' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Business Assets / Equity / Liabilities
                </button>
              </div>
            )}
          </div>

          {/* Capital Gain Section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('capitalGain')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-700">Capital Gain</span>
              {expandedSections.capitalGain ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.capitalGain && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  onClick={() => handleSectionClick('capitalGain', 'capitalGains')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'capitalGain' && activeSubSection === 'capitalGains' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Capital Gains / (Loss)
                </button>
                <button
                  onClick={() => handleSectionClick('capitalGain', 'longTerm')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'capitalGain' && activeSubSection === 'longTerm' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Long Term
                </button>
                <button
                  onClick={() => handleSectionClick('capitalGain', 'shortTerm')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'capitalGain' && activeSubSection === 'shortTerm' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Short Term
                </button>
              </div>
            )}
          </div>

          {/* Other Sources Section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('otherSources')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-700">Other Sources</span>
              {expandedSections.otherSources ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.otherSources && (
              <div className="ml-4 mt-1">
                <button
                  onClick={() => handleSectionClick('otherSources', 'receiptsDeductions')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'otherSources' && activeSubSection === 'receiptsDeductions' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Receipts / Deductions
                </button>
              </div>
            )}
          </div>

          {/* Foreign Sources / Agriculture Section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('foreignSources')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-700">Foreign Sources / Agriculture</span>
              {expandedSections.foreignSources ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.foreignSources && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  onClick={() => handleSectionClick('foreignSources', 'foreignSources')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'foreignSources' && activeSubSection === 'foreignSources' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Foreign Sources
                </button>
                <button
                  onClick={() => handleSectionClick('foreignSources', 'agriculture')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'foreignSources' && activeSubSection === 'agriculture' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Agriculture
                </button>
              </div>
            )}
          </div>

          {/* Tax Chargeable / Payments Section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('taxChargeable')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-700">Tax Chargeable / Payments</span>
              {expandedSections.taxChargeable ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.taxChargeable && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  onClick={() => handleSectionClick('taxChargeable', 'deductibleAllowances')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'taxChargeable' && activeSubSection === 'deductibleAllowances' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Deductible Allowances
                </button>
                <button
                  onClick={() => handleSectionClick('taxChargeable', 'taxChargeable')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'taxChargeable' && activeSubSection === 'taxChargeable' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Tax Chargeable
                </button>
                <button
                  onClick={() => handleSectionClick('taxChargeable', 'taxReductions')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'taxChargeable' && activeSubSection === 'taxReductions' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Tax Reductions
                </button>
                <button
                  onClick={() => handleSectionClick('taxChargeable', 'taxCredits')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'taxChargeable' && activeSubSection === 'taxCredits' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Tax Credits
                </button>
                <button
                  onClick={() => handleSectionClick('taxChargeable', 'capitalAssets')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'taxChargeable' && activeSubSection === 'capitalAssets' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Capital Assets
                </button>
                <button
                  onClick={() => handleSectionClick('taxChargeable', 'adjustableTax')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'taxChargeable' && activeSubSection === 'adjustableTax' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Adjustable Tax
                </button>
                <button
                  onClick={() => handleSectionClick('taxChargeable', 'computations')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'taxChargeable' && activeSubSection === 'computations' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Computations
                </button>
              </div>
            )}
          </div>

          {/* 116 - Wealth Statement Section */}
          <div className="mb-2">
            <button
              onClick={() => toggleSection('wealthStatement')}
              className="w-full flex items-center justify-between px-3 py-2 hover:bg-gray-100 rounded"
            >
              <span className="font-medium text-gray-700">116 - Wealth Statement</span>
              {expandedSections.wealthStatement ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
            </button>
            {expandedSections.wealthStatement && (
              <div className="ml-4 mt-1 space-y-1">
                <button
                  onClick={() => handleSectionClick('wealthStatement', 'personalExpenses')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'wealthStatement' && activeSubSection === 'personalExpenses' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Personal Expenses
                </button>
                <button
                  onClick={() => handleSectionClick('wealthStatement', 'personalAssets')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'wealthStatement' && activeSubSection === 'personalAssets' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Personal Assets / Liabilities
                </button>
                <button
                  onClick={() => handleSectionClick('wealthStatement', 'reconciliation')}
                  className={`w-full text-left px-3 py-2 text-sm rounded ${activeSection === 'wealthStatement' && activeSubSection === 'reconciliation' ? 'bg-purple-200 text-purple-800' : 'hover:bg-gray-100'}`}
                >
                  – Reconciliation of Net Assets
                </button>
              </div>
            )}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 bg-white">
          <div className="p-6">
            {/* Search and Action Buttons */}
            <div className="flex items-center justify-between mb-6">
              <div className="relative flex-1 max-w-md">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Search Amount Code/Description"
                  className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500"
                  id="search_field"
                />
              </div>
              <div className="flex space-x-3">
                <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm">
                  IMPORT PREVIOUS RETURN
                </button>
                <button className="px-4 py-2 bg-purple-600 text-white rounded hover:bg-purple-700 text-sm">
                  PREPARE PSID
                </button>
                <button className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 text-sm">
                  CALCULATE
                </button>
              </div>
            </div>

            {/* Disclaimer (for adjustable tax section) */}
            {activeSection === 'taxChargeable' && activeSubSection === 'adjustableTax' && (
              <div className="mb-6 p-4 bg-red-50 border-l-4 border-red-500 flex items-start">
                <div className="flex-shrink-0 mr-3">
                  <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center text-white font-bold">!</div>
                </div>
                <p className="text-sm text-red-800">
                  <strong>Disclaimer:</strong> Withholding information are per FBR records. Please modify as per actual records.
                </p>
              </div>
            )}

            {/* Data Table */}
            {renderFields()}
          </div>
        </main>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t py-4 text-center text-sm text-gray-600">
        © 2023 - All Rights Reserved. Federal Board of Revenue. Designed & Developed by PRAL
      </footer>
    </div>
  );
}