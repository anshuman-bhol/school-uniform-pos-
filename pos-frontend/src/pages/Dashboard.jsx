import { useRef, useState } from "react";
//import { MdTableBar } from "react-icons/md";
import { PiUploadBold } from "react-icons/pi";
import { FiDownload } from "react-icons/fi";
import { enqueueSnackbar } from "notistack";
import { useSelector } from "react-redux";
import BackButton from "../components/shared/BackButton"
import UploadOptionsModal from "../components/dashboard/UploadOptionsModal";
import StockUploadOptionsModal from "../components/dashboard/StockUploadOptionsModal";
import TemplateOptionsModal from "../components/dashboard/TemplateOptionsModal";
import ManualStockModal from "../components/inventory/ManualStockModal";
import RecentOrders from "../components/dashboard/RecentOrders";
import Inventory from "../pages/Inventory";
import ProductUpload from "../components/products/ProductUpload";
import TailorModal from "../components/dashboard/TailorModal";
import PaymentLedger from "../components/dashboard/PaymentLedger";
import { downloadCatalogueTemplate, downloadStockTemplate, } from "../https";

const tabs = [
  "Orders",
  "Inventory",
  "Transactions",
];

const Dashboard = () => {
  const [isTailorModalOpen, setIsTailorModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("Orders");
  const [showUploadOptions, setShowUploadOptions] = useState(false);
  const [showStockUploadOptions, setShowStockUploadOptions] = useState(false);
  const [showTemplateOptions, setShowTemplateOptions] = useState(false);
  const [showManualStockModal, setShowManualStockModal] = useState(false);
  const user = useSelector((state) => state.user);

  const buttons = [];

  if (user.role === "admin") {
    buttons.push(
      // {
      //   label: "Add Tailor",
      //   icon: <MdTableBar />,
      //   action: "tailor",
      // },
      {
        label: "Upload Products",
        icon: <PiUploadBold />,
        action: "upload",
      },
      {
        label: "Download Template",
        icon: <FiDownload />,
        action: "template",
      }
    );
  }

  const catalogueUploadRef = useRef(null);
  const mergeUploadRef = useRef(null);
  const stockUploadRef = useRef(null);

  const handleOpenModal = (action) => {
    switch (action) {
      case "tailor":
        setIsTailorModalOpen(true);
        break;
      case "upload":
        setShowUploadOptions(true);
        break;
      case "template":
        setShowTemplateOptions(true);
        break;
      default:
        break;
    }
  };

  const downloadExcel = async (apiCall, filename) => {
    try {
      const response = await apiCall();
      const url = window.URL.createObjectURL(
        new Blob([response.data])
      )
      const link = document.createElement("a");
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
    } catch {
      enqueueSnackbar("Unable to download template", {
        variant: "error",
      });
    }
  };

  return (
    <div className="bg-[#252323] h-[calc(100vh-5rem)] flex flex-col overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 shrink-0">

        {/* Left Buttons */}
        <div className="flex items-center gap-3">
          <div className="flex px-6">
            <BackButton />
          </div>
          {buttons.map(({ label, icon, action }) => (
            <button
              key={action}
              onClick={() => handleOpenModal(action)}
              className="bg-[#1a1a1a] hover:bg-[#262626] px-8 py-3 rounded-lg text-[#f5f5f5] font-semibold text-md flex items-center gap-2 transition"
            >
              {label}
              {icon}
            </button>
          ))}
          <ProductUpload
            ref={catalogueUploadRef}
            uploadType="catalogue"
          />

          <ProductUpload
            ref={mergeUploadRef}
            uploadType="merge"
          />

          <ProductUpload
            ref={stockUploadRef}
            uploadType="stock"
          />
        </div>
        {/* Tabs */}
        <div className="flex items-center gap-3">
          {tabs.map((tab) => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`px-8 py-3 rounded-lg font-semibold transition ${activeTab === tab
                ? "bg-[#262626] text-white"
                : "bg-[#1a1a1a] hover:bg-[#262626] text-[#f5f5f5]"
                }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 min-h-0 overflow-hidden px-4 pb-4">
        {activeTab === "Orders" && (
          <div className="h-full">
            <RecentOrders />
          </div>
        )}

        {activeTab === "Inventory" && (
          <div className="h-full">
            <Inventory />
          </div>
        )}

        {activeTab === "Transactions" && (
          <div className="h-full">
            <PaymentLedger />
          </div>
        )}
      </div>

      {isTailorModalOpen && (
        <TailorModal
          setIsTailorModalOpen={setIsTailorModalOpen}
        />
      )}

      {/* Upload Options */}

      {
        showUploadOptions && (
          <UploadOptionsModal
            onClose={() =>
              setShowUploadOptions(false)
            }

            onCatalogue={() => {
              setShowUploadOptions(false);
              catalogueUploadRef.current?.openFilePicker();
            }}

            onMerge={() => {
              setShowUploadOptions(false);
              mergeUploadRef.current?.openFilePicker();
            }}

            onStock={() => {
              setShowUploadOptions(false);
              setShowStockUploadOptions(true);
            }}
          />
        )
      }

      {/* Stock Upload Options */}
      {
        showStockUploadOptions && (
          <StockUploadOptionsModal
            onClose={() => {
              setShowStockUploadOptions(false);
              setShowUploadOptions(true);
            }}

            onManual={() => {
              setShowStockUploadOptions(false);
              setShowManualStockModal(true);
            }}

            onBulk={() => {
              setShowStockUploadOptions(false);
              stockUploadRef.current?.openFilePicker();
            }}
          />
        )
      }

      {/* Template Options */}
      {
        showTemplateOptions && (
          <TemplateOptionsModal
            onClose={() =>
              setShowTemplateOptions(false)
            }

            onCatalogueTemplate={() => {
              setShowTemplateOptions(false);
              downloadExcel(
                downloadCatalogueTemplate,
                "CatalogueTemplate.xlsx"
              );
            }}

            onStockTemplate={() => {
              setShowTemplateOptions(false);
              downloadExcel(
                downloadStockTemplate,
                "StockTemplate.xlsx"
              );
            }}
          />
        )
      }
      {
        showManualStockModal && (
          <ManualStockModal
            onClose={() =>
              setShowManualStockModal(false)
            }
          />
        )
      }
    </div>

  );
};

export default Dashboard;