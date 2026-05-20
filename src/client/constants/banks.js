/**
 * Danh sách ngân hàng đối tác.
 * Khi thêm/sửa ngân hàng chỉ cần edit file này.
 *
 * Mỗi entry:
 *  - code   : mã ngân hàng (phải khớp `bank_code` trong DB `external_bank_accounts`)
 *  - short  : tên ngắn hiển thị (vd "Vietcombank")
 *  - name   : tên đầy đủ
 *  - color  : màu fallback khi logo lỗi (hex)
 *  - logo  : import từ `src/client/asset/logo_img/`; null = dùng placeholder chữ cái đầu trên nền `color`
 */
import vcbLogo from "../asset/logo_img/vietcombank.png";
import mbLogo from "../asset/logo_img/mbbank-e1688546795885.png";
import bidvLogo from "../asset/logo_img/bidv-1-e1688543714421.png";
import agbLogo from "../asset/logo_img/agribank-1.png";
import acbLogo from "../asset/logo_img/acb-1-e1688382549579.png";
import vpbLogo from "../asset/logo_img/vpbank-1.png";

export const BANKS = [
  {
    code: "VCB",
    short: "Vietcombank",
    name: "Ngân hàng TMCP Ngoại thương Việt Nam",
    color: "#16A34A",
    logo: vcbLogo,
  },
  {
    code: "MB",
    short: "MB",
    name: "Ngân hàng TMCP Quân Đội",
    color: "#DC2626",
    logo: mbLogo,
  },
  {
    code: "BIDV",
    short: "BIDV",
    name: "Ngân hàng TMCP Đầu tư và Phát triển Việt Nam",
    color: "#F59E0B",
    logo: bidvLogo,
  },
  {
    code: "AGB",
    short: "Agribank",
    name: "Ngân hàng Nông nghiệp và Phát triển Nông thôn",
    color: "#7C3AED",
    logo: agbLogo,
  },
  {
    code: "ACB",
    short: "ACB",
    name: "Ngân hàng TMCP Á Châu",
    color: "#2563EB",
    logo: acbLogo,
  },
  {
    code: "VPB",
    short: "VPBank",
    name: "Ngân hàng TMCP Việt Nam Thịnh Vượng",
    color: "#10B981",
    logo: vpbLogo,
  },
];

export const findBankByCode = (code) =>
  BANKS.find((b) => b.code === code) || null;
