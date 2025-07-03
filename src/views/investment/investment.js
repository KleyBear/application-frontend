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

  const formatDate = (dateString) => {
    if (!dateString) return "No Date";
    const date = new Date(dateString.replace(" ", "T"));
    if (isNaN(date)) return "Invalid date";
    return `${date.getDate().toString().padStart(2, "0")}/${
      (date.getMonth() + 1).toString().padStart(2, "0")
    }/${date.getFullYear()}`;
  };

  useEffect(() => {
    const fetchData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return;

        const [invRes, detailRes] = await Promise.all([
          fetch("http://localhost:4000/api/investments", {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch("http://localhost:4000/api/investmentDetail", {
            headers: { Authorization: `Bearer ${token}` },
          }),
        ]);

        const investmentsData = await invRes.json();
        const detailsData = await detailRes.json();

        const investmentList = investmentsData.data.map((inv) => {
          const items = detailsData.data
            .filter((d) => d.id_investment === inv.id)
            .map((detail) => ({
              id: detail.id_investmentDetail || `${detail.id_investment}-${detail.id_product}`,
              name: detail.name_product || `Product ID: ${detail.id_product}`,
              amount: detail.amount,
              subtotal: parseFloat(detail.subtotal || 0),
            }));

          return {
            id: inv.id,
            date: inv.date,
            items,
          };
        });

        setInvestments(investmentList);
        setFilteredInvestments(investmentList);
      } catch (error) {
        console.error("Error loading data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, []);

  useEffect(() => {
    let filtered = [...investments];

    if (searchTerm.trim() !== "") {
      filtered = filtered.filter((inv) =>
        inv.items.some((item) =>
          item.name.toLowerCase().includes(searchTerm.toLowerCase())
        )
      );
    }

    if (dateFrom) {
      const from = new Date(dateFrom + "T00:00:00");
      filtered = filtered.filter((inv) => {
        const invDate = new Date(inv.date.replace(" ", "T"));
        return invDate >= from;
      });
    }

    if (dateTo) {
      const to = new Date(dateTo + "T23:59:59");
      filtered = filtered.filter((inv) => {
        const invDate = new Date(inv.date.replace(" ", "T"));
        return invDate <= to;
      });
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
    setNewDetails((prev) => [...prev, { name_product: "", amount: "", subtotal: "" }]);
  };

  const removeDetailRow = (index) => {
    setNewDetails((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddInvestment = async () => {
    if (!newDate || newDetails.length === 0) return;

    const isValid = newDetails.every(
      (d) => d.name_product && d.amount && d.subtotal
    );
    if (!isValid) return;

    try {
      const token = localStorage.getItem("token");
      if (!token) return;

      const total = newDetails.reduce(
        (acc, cur) => acc + parseFloat(cur.subtotal),
        0
      );

      const invResponse = await fetch("http://localhost:4000/api/investments", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          date: newDate,
          total,
        }),
      });

      const createdInv = await invResponse.json();

      for (const d of newDetails) {
        await fetch("http://localhost:4000/api/investmentDetail", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            amount: parseInt(d.amount),
            subtotal: parseFloat(d.subtotal),
            id_product: null,
            id_investment: createdInv.data.id,
            name_product: d.name_product,
          }),
        });
      }

      const newInvObject = {
        id: createdInv.data.id,
        date: newDate + " 00:00:00",
        items: newDetails.map((d, i) => ({
          id: `new-${createdInv.data.id}-${i + 1}`,
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
    }
  };

  return (
    <CCard className="mb-4" style={{ padding: "1rem" }}>
      <CCardHeader>
        <CRow className="align-items-center g-3">
          <CCol xs="12" md="4">
            <h2>Investment History</h2>
          </CCol>
          <CCol xs="12" md="4">
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

        <CModal visible={modalVisible} onClose={() => setModalVisible(false)} size="lg">
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
                    onChange={(e) => handleDetailChange(index, "name_product", e.target.value)}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    type="number"
                    min="1"
                    placeholder="Amount"
                    value={detail.amount}
                    onChange={(e) => handleDetailChange(index, "amount", e.target.value)}
                  />
                </CCol>
                <CCol md={3}>
                  <CFormInput
                    type="number"
                    min="0"
                    step="0.01"
                    placeholder="Subtotal"
                    value={detail.subtotal}
                    onChange={(e) => handleDetailChange(index, "subtotal", e.target.value)}
                  />
                </CCol>
                <CCol md={2}>
                  <CButton color="danger" size="sm" onClick={() => removeDetailRow(index)}>
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
            <CButton color="secondary" onClick={() => setModalVisible(false)}>
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
                      boxShadow: isActive ? "0 0 15px rgba(141, 101, 252, 0.4)" : "none",
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
              <CPaginationItem disabled={page === 1} onClick={() => setPage((p) => Math.max(p - 1, 1))}>
                Previous
              </CPaginationItem>
              {Array.from({ length: pageCount }, (_, i) => (
                <CPaginationItem key={i} active={page === i + 1} onClick={() => setPage(i + 1)}>
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
