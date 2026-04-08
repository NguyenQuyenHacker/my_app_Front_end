import adminApi from "./axios";

export const getCustomers = async () => {
  const response = await adminApi.get("/admin/customers");

  return response.data;
};

export const updateCustomerStatus = async (accountNo, isActive) => {
  const response = await adminApi.patch(
    `/admin/customers/${accountNo}/status`,
    {
      is_active: isActive,
    }
  );
  return response.data;
};
