import { enqueueSnackbar } from "notistack";
import { forwardRef, useImperativeHandle, useRef, } from "react";
import { useQueryClient } from "@tanstack/react-query";
import { uploadCatalogue, uploadStock, addProducts, } from "../../https";

const ProductUpload = forwardRef(
    ({ uploadType = "catalogue" }, ref) => {
        const inputRef = useRef(null);
        const queryClient = useQueryClient();
        const uploadExcel = async (e) => {
            const file = e.target.files[0];
            if (!file) return;
            if (
                file.type !==
                "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" &&
                !file.name.endsWith(".xlsx")
            ) {
                enqueueSnackbar(
                    "Please upload a valid Excel (.xlsx) file.",
                    {
                        variant: "warning",
                    }
                );
                return;
            }
            const formData = new FormData();
            formData.append("file", file);
            try {
                let response;
                switch (uploadType) {
                    case "catalogue":
                        if (
                            !window.confirm(
                                "Uploading a new catalogue will synchronize your catalogue with the Excel file. Products removed from the file will be deleted, existing products will retain their stock, and new products will be added with stock 0. Continue?"
                            )
                        ) {
                            inputRef.current.value = "";
                            return;
                        }
                        response = await uploadCatalogue(formData);
                        break;
                    case "merge":
                        response = await addProducts(formData);
                        break;
                    case "stock":
                        response = await uploadStock(formData);
                        break;
                    default:
                        throw new Error("Invalid upload type");
                }

                enqueueSnackbar(
                    response.data.message,
                    {
                        variant: "success",
                    }
                );
                queryClient.invalidateQueries({
                    queryKey: ["products"],
                });

                queryClient.invalidateQueries({
                    queryKey: ["stock-history"],
                });
                inputRef.current.value = "";
            } catch (error) {
                console.log(error);
                enqueueSnackbar(
                    error.response?.data?.message ||
                    error.message ||
                    "Upload failed",
                    {
                        variant: "error",
                    }
                );
            }
        };
        useImperativeHandle(ref, () => ({
            openFilePicker() {
                inputRef.current.click();
            },
        }));
        return (
            <input
                ref={inputRef}
                hidden
                type="file"
                accept=".xlsx"
                onChange={uploadExcel}
            />
        );

    }
);

export default ProductUpload;