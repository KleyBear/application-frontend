import React, { useState, useEffect } from "react";
import {
  CCard,
  CCardHeader,
  CCardBody,
  CAccordion,
  CAccordionItem,
  CAccordionHeader,
  CAccordionBody,
  CSpinner,
  CFormInput,
  CRow,
  CCol,
  CPagination,
  CPaginationItem,
  CButton,
  CModal,
  CModalHeader,
  CModalBody,
  CModalFooter,
} from "@coreui/react";
import "./investment.scss";

const Investment = () => {
  const [investments, setInvestments] = useState([]);
  const [filteredInvestments, setFilteredInvestments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeKey, setActiveKey] = useState(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [dateFrom, setDateFrom] = useState("");
  const [dateTo, setDateTo] = useState("");
  const [modalVisible, setModalVisible] = useState(false);

  const [newDate, setNewDate] = useState("");
  const [newDetails, setNewDetails] = useState([]);

  const itemsPerPage = 5;
  const [page, setPage] = useState(1);

  const columns = [
    { key: "name", label: "Product" },
    { key: "amount", label: "Amount" },
    { key: "subtotal", label: "Subtotal ($)" },
  ];

  // Función para formatear fecha sin desfase de zona horaria
  function formatDate(dateString) {
    let date;
    if (typeof dateString === "string") {
      const parts = dateString.split("-");
      if (parts.length === 3) {
        date = new Date(parts[0], parts[1] - 1, parts[2]);
      } else {
        date = new Date(dateString);
      }
    } else if (dateString instanceof Date) {
      date = dateString;
    } else {
      return "Invalid date";
    }

    if (isNaN(date)) return "Invalid date";

    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();

    return `${day}/${month}/${year}`;
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [invRes, detailRes] = await Promise.all([
          fetch("http://localhost:8000/investment"),
          fetch("http://localhost:8000/investment_detail"),
        ]);

        const [investmentsData, detailsData] = await Promise.all([
          invRes.json(),
          detailRes.json(),
        ]);

        const investmentList = investmentsData.map((inv) => {
          const items = detailsData
            .filter((d) => d.id_investment === inv.id_investment)
            .map((detail) => ({
              id:
                detail.id_investment_detail ||
                `${detail.id_investment}-${detail.id_product}`,
              name: detail.name_product || "Unknown Product",
              amount: detail.amount,
              subtotal: parseFloat(detail.subtotal || 0),
            }));

          return {
            id: inv.id_investment,
            date: inv.date,
            items,
          };
        });

        setInvestments(investmentList);
        setFilteredInvestments(investmentList);
        setLoading(false);
      } catch (error) {
        console.error("Error loading data:", error);
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    // DEBUG: mostrar fechas en consola para verificar
    console.log("Investments dates:", investments.map((i) => i.date));

    let filtered = [...investments];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((inv) =>
        inv.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (dateFrom) {
      const fromDate = new Date(dateFrom + "T00:00:00");
      filtered = filtered.filter((inv) => new Date(inv.date) >= fromDate);
    }

    if (dateTo) {
      const toDate = new Date(dateTo + "T23:59:59");
      filtered = filtered.filter((inv) => new Date(inv.date) <= toDate);
    }

    setFilteredInvestments(filtered);
    setPage(1);
  }, [searchTerm, dateFrom, dateTo, investments]);

  const handleToggle = (key) => {
    setActiveKey(activeKey === key ? null : key);
  };

  const pageCount = Math.ceil(filteredInvestments.length / itemsPerPage);
  const displayedInvestments = filteredInvestments.slice(
    (page - 1) * itemsPerPage,
    page * itemsPerPage
  );

  const handleDetailChange = (index, field, value) => {
    setNewDetails((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: value };
      return updated;
    });
  };

  const addDetailRow = () => {
    setNewDetails((prev) => [
      ...prev,
      { name_product: "", amount: "", subtotal: "" },
    ]);
  };

  const removeDetailRow = (index) => {
    setNewDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddInvestment = async () => {
    if (!newDate) {
      alert("Please select a date");
      return;
    }
    if (newDetails.length === 0) {
      alert("Please add at least one investment detail");
      return;
    }
    for (const d of newDetails) {
      if (!d.name_product || !d.amount || !d.subtotal) {
        alert("Please complete all detail fields");
        return;
      }
    }

    try {
      const total = newDetails.reduce(
        (acc, cur) => acc + parseFloat(cur.subtotal),
        0
      );

      // Enviar nueva inversión (sin provider, solo fecha y total)
      const invResponse = await fetch("http://localhost:8000/investment", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date: newDate,
          total,
        }),
      });

      if (!invResponse.ok) throw new Error("Failed to create investment");

      const createdInv = await invResponse.json();

      // Enviar detalles asociados
      for (const d of newDetails) {
        await fetch("http://localhost:8000/investment_detail", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            amount: parseInt(d.amount),
            subtotal: parseFloat(d.subtotal),
            id_product: null,
            id_investment: createdInv.id_investment,
            name_product: d.name_product,
          }),
        });
      }

      const newInvObject = {
        id: createdInv.id_investment,
        date: newDate, // importante mantener el formato exacto
        items: newDetails.map((d, i) => ({
          id: `new-${createdInv.id_investment}-${i + 1}`,
          name: d.name_product,
          amount: d.amount,
          subtotal: parseFloat(d.subtotal),
        })),
      };

      setInvestments((prev) => [newInvObject, ...prev]);
      setModalVisible(false);
      setNewDate("");
      setNewDetails([]);
    } catch (error) {
      console.error("Error saving investment:", error);
      alert("Error saving investment. Check console for details.");
    }
  };

  return (
    <CCard className="mb-4" style={{ padding: "1rem" }}>
      <CCardHeader>
        <CRow className="align-items-center g-3">
          <CCol xs="12" md="4">
            <h2>Investment History</h2>
          </CCol>

          <CCol xs="12" md="4" className="d-flex gap-2">
            <CFormInput
              type="text"
              placeholder="Search by product..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              style={{ borderRadius: "25px" }}
            />
          </CCol>

          <CCol xs="6" md="2">
            <CFormInput
              type="date"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              max={dateTo || ""}
            />
          </CCol>

          <CCol xs="6" md="2">
            <CFormInput
              type="date"
              value={dateTo}
              onChange={(e) => setDateTo(e.target.value)}
              min={dateFrom || ""}
            />
          </CCol>
        </CRow>
      </CCardHeader>

      <CCardBody>
        <div className="d-flex justify-content-between mb-3">
          <CButton color="primary" onClick={() => setModalVisible(true)}>
            Add Investment
          </CButton>
        </div>

        <CModal
          visible={modalVisible}
          onClose={() => setModalVisible(false)}
          size="lg"
        >
          <CModalHeader>Add New Investment</CModalHeader>
          <CModalBody>
            <CRow className="mb-3">
              <CCol md={6}>
                <label>Date</label>
                <CFormInput
                  type="date"
                  value={newDate}
                  onChange={(e) => setNewDate(e.target.value)}
                />
              </CCol>
            </CRow>

            <hr />

            <h5>Investment Details</h5>

            {newDetails.map((detail, index) => (
              <CRow key={index} className="mb-2 align-items-center">
                <CCol md={4}>
                  <CFormInput
                    type="text"
                    placeholder="Product Name"
                    value={detail.name_product || ""}
                    onChange={(e) =>
                      handleDetailChange(index, "name_product", e.target.value)
                    }
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    type="number"
                    min="1"
                    placeholder="Amount"
                    value={detail.amount}
                    onChange={(e) =>
                      handleDetailChange(index, "amount", e.target.value)
                    }
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Subtotal"
                    value={detail.subtotal}
                    onChange={(e) =>
                      handleDetailChange(index, "subtotal", e.target.value)
                    }
                  />
                </CCol>
                <CCol md={2}>
                  <CButton
                    color="danger"
                    size="sm"
                    onClick={() => removeDetailRow(index)}
                  >
                    Remove
                  </CButton>
                </CCol>
              </CRow>
            ))}

            <CButton color="success" size="sm" onClick={addDetailRow}>
              + Add Detail
            </CButton>
          </CModalBody>

          <CModalFooter>
            <CButton
              color="secondary"
              onClick={() => setModalVisible(false)}
            >
              Cancel
            </CButton>
            <CButton color="primary" onClick={handleAddInvestment}>
              Save
            </CButton>
          </CModalFooter>
        </CModal>

        {loading ? (
          <div className="text-center">
            <CSpinner color="primary" />
          </div>
        ) : filteredInvestments.length === 0 ? (
          <p className="text-center">No investments found with those filters.</p>
        ) : (
          <>
            <CAccordion alwaysOpen>
              {displayedInvestments.map((inv) => {
                const isActive = activeKey === inv.id;
                const totalAmount = inv.items.reduce(
                  (sum, item) => sum + parseFloat(item.subtotal || 0),
                  0
                );
                return (
                  <CAccordionItem
                    key={`inv-${inv.id}`}
                    itemKey={`inv-${inv.id}`}
                    style={{
                      borderRadius: "12px",
                      marginBottom: "10px",
                      boxShadow: isActive
                        ? "0 0 15px rgba(141, 101, 252, 0.4)"
                        : "none",
                      transition: "all 0.3s ease",
                    }}
                  >
                    <CAccordionHeader onClick={() => handleToggle(inv.id)}>
                      <div className="d-flex justify-content-between w-100">
                        <strong>{formatDate(inv.date)}</strong>
                        <CButton size="sm" color="success" disabled>
                          Total: ${totalAmount.toFixed(2)}
                        </CButton>
                      </div>
                    </CAccordionHeader>
                    <CAccordionBody>
                      <table className="table table-hover">
                        <thead>
                          <tr>
                            {columns.map((col) => (
                              <th key={col.key}>{col.label}</th>
                            ))}
                          </tr>
                        </thead>
                        <tbody>
                          {inv.items.map((item, index) => (
                            <tr key={`item-${item.id || index}`}>
                              <td>{item.name}</td>
                              <td>{item.amount}</td>
                              <td>{item.subtotal}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </CAccordionBody>
                  </CAccordionItem>
                );
              })}
            </CAccordion>

            <CPagination className="mt-4">
              <CPaginationItem
                disabled={page === 1}
                onClick={() => setPage((p) => Math.max(p - 1, 1))}
              >
                Previous
              </CPaginationItem>
              {Array.from({ length: pageCount }, (_, i) => (
                <CPaginationItem
                  key={i}
                  active={page === i + 1}
                  onClick={() => setPage(i + 1)}
                >
                  {i + 1}
                </CPaginationItem>
              ))}
              <CPaginationItem
                disabled={page === pageCount}
                onClick={() => setPage((p) => Math.min(p + 1, pageCount))}
              >
                Next
              </CPaginationItem>
            </CPagination>
          </>
        )}
      </CCardBody>
    </CCard>
  );
};

export default Investment;
