import { ApprovalCard, type ActionRequest, type ReviewConfig } from "./ApprovalCard";

// Sử dụng any để tránh xung đột kiểu dữ liệu với LangChain SDK
type HITLApprovalRendererProps = {
  interrupt: any;
  submit: any;
  isProcessing?: boolean;
};

function normalizeInterrupt(interrupt: any): any {
  if (!interrupt) return null;

  // Trường hợp 1: Là JavaScript Map thực thụ (SDK mới)
  if (interrupt instanceof Map && interrupt.size > 0) {
    const firstValue = Array.from(interrupt.values())[0];
    const val = Array.isArray(firstValue) ? firstValue[0] : firstValue;
    return val?.value || val;
  }

  // Trường hợp 2: Là mảng
  if (Array.isArray(interrupt) && interrupt.length > 0) {
    const val = interrupt[0];
    return val?.value || val;
  }

  // Trường hợp 3: Có thuộc tính value trực tiếp
  if (typeof interrupt === "object" && "value" in interrupt && interrupt.value) {
    return interrupt.value;
  }

  // Trường hợp 4: Đã là mảng hoặc object chứa dữ liệu
  if (typeof interrupt === "object" && (interrupt.actionRequests || interrupt.action_requests)) {
    return interrupt;
  }

  // Trường hợp 5: Là Map dạng Object (JSON payload có key là UUID)
  if (typeof interrupt === "object") {
    const keys = Object.keys(interrupt);
    if (keys.length > 0) {
      const first = interrupt[keys[0]];
      const val = Array.isArray(first) ? first[0] : first;
      return val?.value || val;
    }
  }

  return null;
}

export function HITLApprovalRenderer({
  interrupt,
  submit,
  isProcessing = false,
}: HITLApprovalRendererProps) {
  const request = normalizeInterrupt(interrupt);

  if (!request) return null;

  // Hỗ trợ cả camelCase và snake_case
  const actionRequests = request.actionRequests || request.action_requests;
  const reviewConfigs = request.reviewConfigs || request.review_configs;

  const actionRequest = actionRequests?.[0];
  const reviewConfig = reviewConfigs?.[0];

  if (!actionRequest) return null;

  const actionName = actionRequest.action || actionRequest.name;
  const isTransferMoney = actionName === "create_transfer_request";

  return (
    <ApprovalCard
      actionRequest={actionRequest}
      reviewConfig={reviewConfig}
      isProcessing={isProcessing}
      onApprove={(otp) => {
        if (isTransferMoney) {
          submit(null, {
            command: {
              resume: {
                decisions: [{
                  type: "edit",
                  edited_action: {
                    name: actionName,
                    args: { ...actionRequest.args, otp },
                  },
                }],
              },
            },
          });
          return;
        }

        submit(null, {
          command: {
            resume: {
              decisions: [{ type: "approve" }],
            },
          },
        });
      }}
      onEdit={(editedArgs) => {
        submit(null, {
          command: {
            resume: {
              decisions: [{
                type: "edit",
                edited_action: {
                  name: actionName,
                  args: editedArgs,
                },
              }],
            },
          },
        });
      }}
      onReject={(reason) => {
        submit(null, {
          command: {
            resume: {
              decisions: [{ type: "reject", message: reason || undefined }],
            },
          },
        });
      }}
    />
  );
}
