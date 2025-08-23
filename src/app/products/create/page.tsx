
'use client';

import * as React from 'react';

export default function CreateProductPage() {
  React.useEffect(() => {
    /* ---------- State ---------- */
    const state = {
      stockDrivingAttrs: [] as {name: string, values: string[], code: string}[], 
      variants: [] as any[]
    };

    /* ---------- Helpers ---------- */
    const slug = (s: string) => (s || "")
      .toString()
      .trim()
      .toLowerCase()
      .replace(/[^\w\s-]/g,"")
      .replace(/\s+/g,"-");

    const shortCode = (s: string) => (s || "")
      .toString()
      .trim()
      .toUpperCase()
      .replace(/[^A-Z0-9]/g,"")
      .slice(0,6) || "X";

    /* Cartesian product of attribute values */
    function cartesian(arrays: string[][]): string[][] {
      if (!arrays || arrays.length === 0) {
        return [];
      }
      return arrays.reduce((acc, curr) => {
        const res: string[][] = [];
        acc.forEach(a => {
          (curr || []).forEach(b => res.push(a.concat([b])));
        });
        return res;
      }, [[]] as string[][]);
    }

    /* Re-render selected attributes pills */
    function renderSelectedAttrs() {
      const wrap = document.getElementById("selectedAttrs");
      if (!wrap) return;
      if (state.stockDrivingAttrs.length === 0) {
        wrap.innerHTML = "None yet. Add “Pack Size”, “Brand”, etc.";
        return;
      }
      wrap.innerHTML = "";
      state.stockDrivingAttrs.forEach((a, idx) => {
        const el = document.createElement("span");
        el.className = "pill";
        el.innerHTML = `<strong>${a.name}</strong>
      <button class="btn-ghost" style="border:none;cursor:pointer" data-remove-attr="${idx}" title="Remove">✕</button>`;
        wrap.appendChild(el);
      });
    }

    /* Render attribute editors (value chips) */
    function renderAttrEditors() {
      const area = document.getElementById("attrEditorArea");
      if (!area) return;
      area.innerHTML = "";
      state.stockDrivingAttrs.forEach((attr, idx) => {
        const card = document.createElement("div");
        card.style.border = "1px solid var(--line)";
        card.style.borderRadius = "10px";
        card.style.padding = "12px";
        card.style.background = "#fff";
        card.innerHTML = `
      <div class="row">
        <div>
          <label>Attribute</label>
          <input type="text" value="${attr.name}" data-edit-name="${idx}" />
        </div>
        <div>
          <label>Values (comma separated)</label>
          <input type="text" value="${(attr.values || []).join(", ")}" data-edit-values="${idx}" placeholder="e.g., 500ml, 1L, 2L" />
        </div>
      </div>
      <div class="small" style="margin-top:6px;">Only values listed here will generate SKUs.</div>
    `;
        area.appendChild(card);
      });
    }

    /* Build variant header based on chosen attributes */
    function renderVariantHeader() {
      const headRow = document.getElementById("variantHeader");
      if (!headRow) return;
      // Reset to base columns
      headRow.innerHTML = "";
      state.stockDrivingAttrs.forEach(a => {
        const th = document.createElement("th");
        th.textContent = a.name;
        headRow.appendChild(th);
      });
      ["SKU","Barcode","Price","Stock","Allocated","Available","Reorder Point"].forEach(h => {
        const th = document.createElement("th");
        th.textContent = h;
        headRow.appendChild(th);
      });
    }

    /* Render variant rows */
    function renderVariantRows() {
      const body = document.getElementById("variantBody");
      if (!body) return;
      body.innerHTML = "";
      if (state.variants.length === 0) {
        const tr = document.createElement("tr");
        const td = document.createElement("td");
        td.colSpan = Math.max(7, state.stockDrivingAttrs.length + 7);
        td.className = "small";
        td.textContent = "No variants yet.";
        tr.appendChild(td);
        body.appendChild(tr);
        return;
      }

      state.variants.forEach(v => {
        const tr = document.createElement("tr");
        // low-stock highlight
        const available = (v.stock || 0) - (v.allocated || 0);
        if (available <= (v.reorderPoint || 0)) tr.classList.add("low");

        // attribute cells
        v.values.forEach((val: string) => {
          const td = document.createElement("td");
          td.textContent = val;
          tr.appendChild(td);
        });

        // editable cells
        const skuTd = document.createElement("td");
        const skuInput = document.createElement("input");
        skuInput.type = "text";
        skuInput.value = v.sku;
        skuInput.addEventListener("input", e => v.sku = (e.target as HTMLInputElement).value);
        skuTd.appendChild(skuInput);
        tr.appendChild(skuTd);

        const bcTd = document.createElement("td");
        const bcInput = document.createElement("input");
        bcInput.type = "text";
        bcInput.placeholder = "Barcode";
        bcInput.value = v.barcode || "";
        bcInput.addEventListener("input", e => v.barcode = (e.target as HTMLInputElement).value);
        bcTd.appendChild(bcInput);
        tr.appendChild(bcTd);

        const priceTd = document.createElement("td");
        const priceInput = document.createElement("input");
        priceInput.type = "number";
        priceInput.step = "0.01";
        priceInput.placeholder = "0.00";
        priceInput.value = v.price ?? "";
        priceInput.addEventListener("input", e => v.price = parseFloat((e.target as HTMLInputElement).value||'0'));
        priceTd.appendChild(priceInput);
        tr.appendChild(priceTd);

        const stockTd = document.createElement("td");
        const stockInput = document.createElement("input");
        stockInput.type = "number";
        stockInput.placeholder = "0";
        stockInput.value = v.stock ?? 0;
        stockInput.addEventListener("input", e => { v.stock = parseInt((e.target as HTMLInputElement).value||'0',10); refreshRow(tr, v); });
        stockTd.appendChild(stockInput);
        tr.appendChild(stockTd);

        const allocTd = document.createElement("td");
        const allocInput = document.createElement("input");
        allocInput.type = "number";
        allocInput.placeholder = "0";
        allocInput.value = v.allocated ?? 0;
        allocInput.addEventListener("input", e => { v.allocated = parseInt((e.target as HTMLInputElement).value||'0',10); refreshRow(tr, v); });
        allocTd.appendChild(allocInput);
        tr.appendChild(allocTd);

        const availTd = document.createElement("td");
        availTd.textContent = available.toString();
        tr.appendChild(availTd);

        const rpTd = document.createElement("td");
        const rpInput = document.createElement("input");
        rpInput.type = "number";
        rpInput.placeholder = "e.g., 5";
        rpInput.value = v.reorderPoint ?? 0;
        rpInput.addEventListener("input", e => { v.reorderPoint = parseInt((e.target as HTMLInputElement).value||'0',10); refreshRow(tr, v); });
        rpTd.appendChild(rpInput);
        tr.appendChild(rpTd);

        body.appendChild(tr);
      });
    }

    /* Update row styling & available calc */
    function refreshRow(tr: HTMLTableRowElement, v: any) {
      const tds = tr.querySelectorAll("td");
      const available = (v.stock||0) - (v.allocated||0);
      // available cell is at: attributes count + (0:SKU,1:Barcode,2:Price,3:Stock,4:Allocated) ->  attributes + 5
      const availCell = tds[state.stockDrivingAttrs.length + 5];
      if (availCell) availCell.textContent = available.toString();

      if (available <= (v.reorderPoint || 0)) tr.classList.add("low"); else tr.classList.remove("low");
    }

    /* Generate SKU from product code + attribute short codes */
    function buildSku(baseCode: string, attrNames: string[], values: string[]) {
      const parts = [shortCode(baseCode)];
      values.forEach((val, i) => {
        const code = shortCode(val);
        parts.push(code);
      });
      return parts.filter(Boolean).join("-");
    }

    /* ---------- Events ---------- */
    const handlePresetClick = (e: Event) => {
        const btn = e.currentTarget as HTMLButtonElement;
        const name = btn.getAttribute("data-preset");
        if (!name) return;
        // avoid duplicates
        if (state.stockDrivingAttrs.some(a => a.name.toLowerCase() === name.toLowerCase())) return;
        const defaults: Record<string, string[]> = {
            "Brand": ["Amul","Mother Dairy","Nestle"],
            "Pack Size": ["200ml","500ml","1L","2L"],
            "Flavor": ["Plain","Vanilla","Strawberry","Chocolate"],
            "Fat %": ["Toned","Full Cream","Skimmed"],
            "Color": ["Red","Green","Blue"]
        };
        state.stockDrivingAttrs.push({ name, values: defaults[name] || [], code: slug(name) });
        renderSelectedAttrs();
        renderAttrEditors();
    };

    const handleAddCustomAttr = () => {
        const input = document.getElementById("customAttrName") as HTMLInputElement;
        if (!input) return;
        const name = (input.value || "").trim();
        if (!name) return;
        if (state.stockDrivingAttrs.some(a => a.name.toLowerCase() === name.toLowerCase())) return;
        state.stockDrivingAttrs.push({ name, values: [], code: slug(name) });
        input.value = "";
        renderSelectedAttrs();
        renderAttrEditors();
    };

    const handleRemoveAttr = (e: Event) => {
        const target = e.target as HTMLElement;
        const idx = target.getAttribute("data-remove-attr");
        if (idx !== null) {
            state.stockDrivingAttrs.splice(parseInt(idx,10),1);
            renderSelectedAttrs();
            renderAttrEditors();
            renderVariantHeader();
            state.variants = [];
            renderVariantRows();
        }
    };
    
    const handleAttrEditorInput = (e: Event) => {
        const target = e.target as HTMLInputElement;
        const nameIdx = target.getAttribute("data-edit-name");
        const valsIdx = target.getAttribute("data-edit-values");
        if (nameIdx !== null) {
            state.stockDrivingAttrs[Number(nameIdx)].name = target.value;
            state.stockDrivingAttrs[Number(nameIdx)].code = slug(target.value);
            renderSelectedAttrs();
            renderVariantHeader();
            renderVariantRows();
        }
        if (valsIdx !== null) {
            const vals = target.value.split(",").map(s => s.trim()).filter(Boolean);
            state.stockDrivingAttrs[Number(valsIdx)].values = vals;
        }
    };

    const handleGenerateVariants = () => {
        const attrs = state.stockDrivingAttrs.filter(a => (a.values || []).length > 0);
        if (attrs.length === 0) { alert("Add at least one attribute with values."); return; }

        renderVariantHeader();

        const productCodeInput = document.getElementById("productCode") as HTMLInputElement;
        const productNameInput = document.getElementById("productName") as HTMLInputElement;
        const baseCode = productCodeInput?.value || productNameInput?.value || "PROD";
        
        const valueArrays = attrs.map(a => a.values);
        const combos = cartesian(valueArrays);
        
        state.variants = combos.map(values => ({
            values, // aligned to attrs order
            sku: buildSku(baseCode, attrs.map(a => a.name), values),
            barcode: "",
            price: "",
            stock: 0,
            allocated: 0,
            reorderPoint: 0
        }));

        renderVariantRows();
    };

    const handleClearVariants = () => {
        state.variants = [];
        renderVariantRows();
    };

    const handleResetAll = () => {
        if (!confirm("Reset everything?")) return;
        // clear inputs
        ["productName","productCode","category","uom","shortDesc","attrMaterial","attrStorage","attrOrigin","attrCert","attrTags","customAttrName"].forEach(id=>{
            const el = document.getElementById(id) as HTMLInputElement;
            if (el) el.value = "";
        });
        state.stockDrivingAttrs = [];
        state.variants = [];
        renderSelectedAttrs();
        renderAttrEditors();
        renderVariantHeader();
        renderVariantRows();
    };

    // Add event listeners
    const presetButtons = document.querySelectorAll("[data-preset]");
    presetButtons.forEach(btn => btn.addEventListener("click", handlePresetClick));

    const addCustomAttrBtn = document.getElementById("addCustomAttr");
    addCustomAttrBtn?.addEventListener("click", handleAddCustomAttr);

    const selectedAttrsContainer = document.getElementById("selectedAttrs");
    selectedAttrsContainer?.addEventListener("click", handleRemoveAttr);

    const attrEditorAreaContainer = document.getElementById("attrEditorArea");
    attrEditorAreaContainer?.addEventListener("input", handleAttrEditorInput);
    
    const generateVariantsBtn = document.getElementById("generateVariants");
    generateVariantsBtn?.addEventListener("click", handleGenerateVariants);

    const clearVariantsBtn = document.getElementById("clearVariants");
    clearVariantsBtn?.addEventListener("click", handleClearVariants);

    const resetAllBtn = document.getElementById("resetAll");
    resetAllBtn?.addEventListener("click", handleResetAll);

    // Initial renders
    renderSelectedAttrs();
    renderAttrEditors();
    renderVariantHeader();
    renderVariantRows();

    // Cleanup function
    return () => {
        presetButtons.forEach(btn => btn.removeEventListener("click", handlePresetClick));
        addCustomAttrBtn?.removeEventListener("click", handleAddCustomAttr);
        selectedAttrsContainer?.removeEventListener("click", handleRemoveAttr);
        attrEditorAreaContainer?.removeEventListener("input", handleAttrEditorInput);
        generateVariantsBtn?.removeEventListener("click", handleGenerateVariants);
        clearVariantsBtn?.removeEventListener("click", handleClearVariants);
        resetAllBtn?.removeEventListener("click", handleResetAll);
    };
  }, []);

  return (
    <>
      <div className='p-6'>
        <h1>Add Product — Grocery</h1>

        <div className="grid two">
          {/* Core Product (SPU) */}
          <section>
            <h2>1) Core Product (Parent)</h2>
            <div className="row">
              <div>
                <label>Product Name *</label>
                <input id="productName" type="text" placeholder="e.g., Amul Milk" />
              </div>
              <div>
                <label>Product Code (for SKU prefix)</label>
                <input id="productCode" type="text" placeholder="e.g., MLK-AMUL" />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Category</label>
                <input id="category" type="text" placeholder="e.g., Dairy" />
              </div>
              <div>
                <label>Base UOM</label>
                <input id="uom" type="text" placeholder="e.g., piece, bottle, kg" />
              </div>
            </div>
            <div>
              <label>Short Description</label>
              <textarea id="shortDesc" placeholder="One-liner for internal search"></textarea>
            </div>
            <div className="hint">This does not create SKUs. SKUs are created below from inventory-driving attributes only.</div>
          </section>

          {/* Descriptive Attributes (do not create SKUs) */}
          <section>
            <h2>2) Descriptive Attributes (won’t create SKUs)</h2>
            <div className="row">
              <div>
                <label>Material / Ingredients</label>
                <input id="attrMaterial" type="text" placeholder="e.g., Cow milk" />
              </div>
              <div>
                <label>Storage / Handling</label>
                <input id="attrStorage" type="text" placeholder="e.g., Keep refrigerated" />
              </div>
            </div>
            <div className="row">
              <div>
                <label>Country of Origin</label>
                <input id="attrOrigin" type="text" placeholder="e.g., India" />
              </div>
              <div>
                <label>Certifications</label>
                <input id="attrCert" type="text" placeholder="e.g., FSSAI" />
              </div>
            </div>
            <div>
              <label>Tags (comma separated)</label>
              <input id="attrTags" type="text" placeholder="e.g., dairy, breakfast, protein" />
            </div>
            <div className="hint">Use these for search/filter. They won’t multiply SKUs or stock tracking.</div>
          </section>
        </div>

        {/* Variant Attribute Builder */}
        <section>
          <h2>3) Inventory-Driving Attributes (these create SKUs)</h2>
          <div className="hint">Only add attributes you truly stock and reorder by. Fewer attributes → fewer SKUs.</div>

          <div className="grid two">
            <div>
              <label>Common grocery attributes</label>
              <div className="toolbar">
                <button className="btn" data-preset="Brand">+ Brand</button>
                <button className="btn" data-preset="Pack Size">+ Pack Size</button>
                <button className="btn" data-preset="Flavor">+ Flavor</button>
                <button className="btn" data-preset="Fat %">+ Fat %</button>
                <button className="btn" data-preset="Color">+ Color</button>
              </div>
              <div className="divider"></div>
              <label>Add custom attribute</label>
              <div className="row">
                <input id="customAttrName" type="text" placeholder="e.g., Region / Plug Type / Strength" />
                <button id="addCustomAttr" className="btn">Add Attribute</button>
              </div>
            </div>

            <div>
              <label>Selected stock-driving attributes</label>
              <div id="selectedAttrs" className="small">None yet. Add “Pack Size”, “Brand”, etc.</div>
            </div>
          </div>

          <div id="attrEditorArea" className="grid" style={{marginTop: '12px'}}></div>

          <div className="toolbar" style={{marginTop: '12px'}}>
            <button id="generateVariants" className="btn-primary">Generate Variants (SKUs)</button>
            <button id="clearVariants" className="btn btn-ghost">Clear Variants</button>
          </div>
        </section>

        {/* Variant Grid */}
        <section>
          <h2>4) Variants (SKUs) & Inventory</h2>
          <div className="hint">Low stock highlights when <strong>Available ≤ Reorder Point</strong>. Available = Stock − Allocated.</div>
          <div style={{overflowX:'auto'}}>
            <table id="variantTable">
              <thead>
                <tr id="variantHeader">
                  {/* dynamic attribute headers */}
                  <th>SKU</th>
                  <th>Barcode</th>
                  <th>Price</th>
                  <th>Stock</th>
                  <th>Allocated</th>
                  <th>Available</th>
                  <th>Reorder Point</th>
                </tr>
              </thead>
              <tbody id="variantBody">
                <tr><td colSpan={7} className="small">No variants yet. Add inventory-driving attributes and click “Generate Variants”.</td></tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Actions */}
        <section>
          <h2>5) Actions</h2>
          <div className="toolbar">
            <button className="btn">Save Draft</button>
            <button className="btn">Save & Add Another</button>
            <button className="btn-primary">Save Product</button>
            <button className="btn-danger" id="resetAll">Reset All</button>
          </div>
        </section>
      </div>
    </>
  );
}
