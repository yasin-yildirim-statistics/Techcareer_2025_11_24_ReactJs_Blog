// REACT
import React, {useEffect, useMemo, useState} from 'react';
import Swal from "sweetalert2"

//TOAST
import toast from "react-hot-toast"
import ReusabilityToast from "../../reusability/ReusabilityToast";

// ROUTER
// import {useNavigate} from 'react-router-dom';

// API LIST CALL
import BlogCategoryApiService from '../../services/BlogCategoryApiService';

// I18N
import {withTranslation} from 'react-i18next';

// IMPORT

// FUNCTION
function BlogCategoryList({props, t, i18n}) {
    // FIELD

    // ROUTER
    //let navigate = useNavigate();

    // STATE
    //const [] = React.useState();
    const [blogCategoryApiListData, setBlogCategoryApiListData] = useState([]); //default boş dizi
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    // MODAL STATE
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [modalMode, setModalMode] = useState("show") // "show" | "create" | "edit"
    const [selectedCategory, setSelectedCategory] = useState(null);

    // FORM STATE (create/update)
    const [formData, setFormData] = useState({
        categoryName: "",
    })
    const [saving, setSaving] = useState(false);

    // SEARCH, FILTER, PAGINATION STATE
    const [searchTerm, setSearchTerm] = useState("");
    const [pageSize, setPageSize] = useState(5);
    const [currentPage, setCurrentPage] = useState(1);

    // =====================================================
    //      TOAST HELPER (react-hot-toast + ReusabilityToast)
    // =====================================================
    /**
     * variant:
     *  - "create"  -> yeşil arka plan
     *  - "update"  -> mavi arka plan
     *  - "delete"  -> kırmızı arka plan
     *  - default   -> gri / nötr
     */
    const showToast = (title, variant = "default") => {
        let style = {
            borderRadius: "10px",
            padding: "10px",
            color: "#ffffff",
            fontWeight: 500,
            fontSize: "0.9rem",
        };
        let icon = "ℹ️";

        switch (variant) {
            case "create":
                style.background = "#146c43"; // yeşil
                icon = "✅";
                break;
            case "update":
                style.background = "#0d6efd"; // mavi
                icon = "ℹ️";
                break;
            case "delete":
                style.background = "#842029"; // kırmızı
                icon = "🗑️";
                break;
            default:
                style.background = "#343a40"; // koyu gri
                icon = "ℹ️";
                break;
        }

        toast(title, {
            icon,
            style,
            duration: 2500,
        });
    };

    // =======================================================================
    // EFFECT (LİSTEYİ ÇEK)
    // =======================================================================
    useEffect(() => {
        // Component Did Mount
        fetchBlogList();
        // fetchBlogList().then(
        //     () => {
        //         showToast("Blog Kategori Listeleme", "list");
        //     }
        // ).catch(() => showToast("Blog Kategori Listelememedi", "list"));
    }, []);

    // FUNCTION
    // FETCH BLOG LIST ASENKRON
    const fetchBlogList = async () => {
        try {

            // Loading
            setLoading(true);
            setError(""); // Eğer daha önceden kalan hatalar varsa onu temizle

            // ASENKRON API ÇAĞRI
            // const response = await fetch('http://localhost:4444/blog/category/api/v1/list');
            const response = await BlogCategoryApiService.objectApiList();

            // Eğer backentten gelen veri varsa
            if (response.status === 200) {
                setBlogCategoryApiListData(response.data);
                console.log(response);
                console.log(response.data);
                console.log(response.status);
                console.log(response.headers);
            }
        } catch (error) {
            console.error('Blog Category fetchBlogList: ', error);
        } finally {
            setLoading(false); // Loading kapat(Zorunlu)
        }
    }; // end fetchBlogList

    // =======================================================================
    // EFFECT (FILTER + PAGINATION+ SEARCH )
    // =======================================================================
    useEffect(() => {
        setCurrentPage(1); // Paginatin ilk sayfada başlat
    }, [searchTerm, pageSize, blogCategoryApiListData.length]);

    // =======================================================================
    /*
    USEMEMO (expensive) hesaplanması maliyetli(pahalı) işlemleri sürekli hesaplamamak için kullandığımız bir React hooksu'dur

    Genellikle: büyük array, filtrelemeler, ağır hesaplamalarda, çok karmaşık obje için kullanırız.
    Amaç: Her render'dan sonra tekrar çalışmasın ancak ilgili parametreler çalışsın(state/props) değiştiğinde tekrar hesaplama yapsın.
    */
    // =======================================================================
    const {pageData, totalItems, totalPages} = useMemo(() => {

        // Search (Küçük karakter+boşluksuz)
        const normalized = searchTerm.toLowerCase().trim();

        // Filter
        const filtered = blogCategoryApiListData.filter((cat) => {
            if (!normalized) return true;

            // Backentten gelen gelen veriler
            const idStr = String(cat.categoryId ?? "").toLowerCase();
            const nameStr = (cat.categoryName ?? "").toLowerCase();
            const dateStr = (cat.systemCreatedDate ?? "").toLowerCase();

            return (
                idStr.includes(normalized) ||
                nameStr.includes(normalized) ||
                dateStr.includes(normalized)
            )
        })

        // Pagination
        const total = filtered.length || 0;
        const pages = total === 0 ? 1 : Math.ceil(total / pageSize);
        const safeCurrentPage = Math.min(Math.max(1, currentPage), pages);
        const startIndex = (safeCurrentPage - 1) * pageSize;
        const paged = filtered.slice(startIndex, startIndex + pageSize);

        return {
            pageData: paged,
            totalItems: total,
            totalPages: pages
        }
    }, [blogCategoryApiListData, searchTerm, pageSize, currentPage]);

    // =======================================================================
    // PAGINATION
    // =======================================================================
    // GOTO PAGE
    const goToPage = (page) => {
        if (page < 1 || page > totalPages) return;
        setCurrentPage(page);
    };

    const getPageNumbers = () => {
        const maxButtons = 5;
        const pages = [];

        let start = Math.max(1, currentPage - Math.floor(maxButtons / 2));
        let end = start + maxButtons - 1;

        if (end > totalPages) {
            end = totalPages;
            start = Math.max(1, end - maxButtons + 1);
        }

        for (let i = start; i <= end; i++) {
            pages.push(i);
        }
        return pages;
    };

    // =======================================================================
    // MODAL HELPER FUNCTIONS
    // =======================================================================
    // CREATE MODAL ACTIVE
    const openCreateModal = () => {
        setModalMode("create");
        setSelectedCategory(null);
        setFormData({
            categoryName: "",
        })
        setIsModalOpen(true);
    }

    // SHOW MODAL ACTIVE
    const openShowModal = (category) => {
        setModalMode("show");
        setSelectedCategory(category);
        setIsModalOpen(true)
    }

    // EDIT MODAL ACTIVE
    const openEditModal = (category) => {
        setModalMode("edit");
        setSelectedCategory(category);
        setFormData({
            categoryName: category.categoryName || "",
        })
        setIsModalOpen(true)
    }

    // CLOSE MODAL ACTIVE
    const closeModal = () => {
        setIsModalOpen(false);
        setSelectedCategory(null);
        setFormData({
            categoryName: "",
        })
        setModalMode("show")
    }

    // =======================================================================
    // FORM HANDLE FUNCTIONS ===> Formda gelen verileri almak
    // =======================================================================
    const handleChange = (event) => {
        const {name, value} = event.target;
        // Form içindeki verileri değiştirmek(set) etmek
        setFormData((prev) => ({
            ...prev,
            [name]: value,
        }))
    }; //end handleChange

    // =======================================================================
    // FORM SUBMIT FUNCTIONS ===> Formda gelen verileri İşlem yapmak
    // =======================================================================
    const handleSubmit = async (event) => {
        // Browser sen dur hiç bir şey yapma ben biliyorum ne yapacağımı
        event.preventDefault();

        // Default
        setSaving(true);
        setError("");

        try {
            if (modalMode === "create") {
                const response = await BlogCategoryApiService.objectApiCreate(formData);
                if (response.status === 200 || response.status === 201) {
                    await fetchBlogList();
                    closeModal();
                    showToast("Blog Kategori Oluşturuldu", "create");
                }
            } else if (modalMode === "edit" &&
                selectedCategory &&
                selectedCategory.categoryId
            ) {
                const response = await BlogCategoryApiService.objectApiUpdate(selectedCategory.categoryId, formData);
                if (response.status === 200) {
                    await fetchBlogList();
                    closeModal();
                    showToast("Blog Kategori Güncellendi", "update");
                }
            }
        } catch (e) {
            console.error("handleSubmit error :", e);
            setError(
                modalMode === "create"
                    ? "Kategori oluştururken bir hata meydana geldi"
                    : "Kategori güncellerken bir hata meydana geldi."
            );
        } finally {
            setSaving(false)
        }
    }; //end handleChange

    // =======================================================================
    // DELETE (SweetAlert2 + TOAST )
    // =======================================================================
    const handleDelete = async (category) => {

        // Sweet Alert
        // if (window.confirm(id + ' nolu datayı silmek istiyor musunuz ?')) { }
        const result = await Swal.fire({
            title: `"${category.categoryName}" Silinsin mi?`,
            text: "Bu işlemi geri alamazsın",
            icon: "warning",
            showCancelButton: true,
            confirmButtonText: "Evet, Sil",
            cancelButtonText: "Vazgeç",
        });

        // Eğer kullanıcı silmekten vazgeçmişse
        if (!result.isConfirmed)
            return;

        // Eğer kullanıcı silmek istiyorsa
        try {
            setError("");
            const response = await BlogCategoryApiService.objectApiDelete(category.categoryId);

            // Server Success ise
            if (response.status === 200) {
                await fetchBlogList();
                closeModal();
                showToast("Blog Kategori Silindi", "delete");
            }
        } catch (e) {
            console.error("handleSubmit error :", e);
            setError("Blog Kategorisinde bir hata meydana geldi");
            //window.location = 'blog/category/list';
        }
    }; // end handleDelete

    // =======================================================================
    // MODAL TITLE & BODY
    // =======================================================================
    const getModalTitle = () => {
        // Modal başlığı
        if (modalMode === "create") return "Yeni Blog Kategorisi Oluştur";
        if (modalMode === "edit") return "Yeni Blog Kategorisi Güncelle";
        return "Blog Kategorisi Detayı";
    };

        // Modal Body
        const renderModalBody = () => {
            if (modalMode === "show" && selectedCategory) {
                return (
                    <div className="mb-2">
                        <div className="mb-2">
                            <strong>{t("blog_id")}: </strong>
                            {selectedCategory.categoryId}
                        </div>

                        <div className="mb-2">
                            <strong>{t("blog_category_name")}: </strong>{" "}
                            {selectedCategory.categoryName}
                        </div>

                        <div className="mb-2">
                            <strong>{t("date")}: </strong>
                            {selectedCategory.systemCreatedDate || "-"}
                        </div>
                    </div>
                ); //end return
            } //end if


            return (
                <form onSubmit={handleSubmit()}>
                    {/*CATEGORY NAME*/}
                    <div className="mb-3">
                        <label
                            htmlFor="categoryName"
                            className="form-label">
                            {t("blog_category_name")}
                        </label>
                        <input
                            type="text"
                            id="categoryName"
                            name="categoryName"
                            className="form-control"
                            value={formData.categoryName}
                            onChange={handleChange}
                            placeholder="kategori name yazınız, Backend, frontend"
                            required
                        />
                    </div>


                    <div className="d-flex justify-content-end gap-2">
                        {/*CLOSE*/}
                        <button
                            type="button"
                            className="btn btn-outline-secondary"
                            onClick={closeModal}
                            disabled={saving}
                        >{t("close")}</button>

                        {/*SUBMIT*/}
                        <button
                            type="submit"
                            className="btn btn-primary"
                            disabled={saving}>
                            {
                                saving ? "Kaydediliyor" : modalMode === "create" ? t("create") : t("update")
                            }
                        </button>
                    </div>
                </form>
            );  //end return
        } //end renderModalBody


    //////////////////////////////////////////////////////////////////////////
    // =======================================================================
    // JSX
    // =======================================================================

    // RETURN
    return (
        <React.Fragment>
            {/*Toaster provider (SAğ,alt, global varsayılan)*/}
            <ReusabilityToast/>

            <br/>
            <h1 className="text-center display-5 mt-3 mb-4 animate_animated animate_fadeInDown">
                {t('blog_category_list')}
            </h1>

            {/*Filter+ Datalist+Yeni kategori Butonu*/}
            <div className="container mb-3">
                <div className="row align-items-end g-2">
                    {/*SEARCH INPUT*/}
                    <div className="col-md-4">
                        <label htmlFor="search_id" className="form-label fw-semibold">
                            Filtrele (ID/ isim/ Tarih)
                        </label>
                        <input
                            type="search"
                            list="blogCategoryNames"
                            id="search_id"
                            className="form-control"
                            placeholder="Ara ..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <datalist id="blogCategoryNames">
                            {blogCategoryApiListData.map((cat) => (
                                <option key={cat.categoryId} value={cat.categoryName}/>
                            ))}
                        </datalist>
                    </div>
                    {/*search*/}

                    {/*FILTER*/}
                    <div className="col-md-3">
                        <label htmlFor="" className="form-label fw-semibold">Sayfa başına kayıt</label>
                        <select
                            className="form-select"
                            value={pageSize}
                            onchange={(e) => setPageSize(Number(e.target.value))}
                            title="Filtreleme için"
                        >
                            <option value={5}>5 Veri Listele</option>
                            <option value={10}>10 Veri Listele</option>
                            <option value={15}>15 Veri Listele</option>
                            <option value={50}>50 Veri Listele</option>
                            <option value={100}>100 Veri Listele</option>
                        </select>
                    </div>

                    {/*TOPLAM KAYIT*/}
                    <div className="col-md-5 text-md-end">
                        <label htmlFor="" className="form-label d-block fw-semibold">
                            Toplam Kayıt
                        </label>
                    </div>

                    <div className="d-flex justify-content-md-end alig-items-center gap-3">
                        <span className="badge bg-secondary">{totalItems} Kayıt</span>
                        <button
                            type="button"
                            className="btn btn-primary"
                            onClick={openCreateModal}
                        >
                            <i className="fa-solid fa-plus me-1"/>
                            {t("create")}
                        </button>
                    </div>
                </div> {/*row*/}
            </div> {/*container*/}

            {/*ALERT ERROR*/}
            { error && (
                    <div className="alert alert-danger mt-1 mb-1 py-2 px-3 text-center">
                        {error}
                    </div>
                )
            }{/*end error*/}

            {/*LOADING ERROR*/}
            {loading ? (
                    <div className="text-center my-5">
                        <div className="spinner-border" role="status"/>
                    </div>
                ) : (
                    <div className="table-responsive mt-3 container animate_animated animate__backInRight">
                        {pageData.length === 0 ? (
                            <div className="alert alert-warning">
                                Filtrelemede Uygun sonuç bulunamadı
                            </div>
                        ) : (
                            <table className="table table-striped table-bordered mb-4 align-middle"
                                   style={{borderRadius: "0.75", overflow: "hidden"}}
                            >
                                <thead>
                                <tr>
                                    <th scope="col">{t('id')}</th>
                                    <th scope="col">{t('blog_category_name')}</th>
                                    <th scope="col">{t('date')}</th>
                                    <th scope="col">{t('update')}</th>
                                    <th scope="col">{t('show')}</th>
                                    <th scope="col">{t('delete')}</th>
                                </tr>
                                </thead>
                                <tbody>
                                {pageData.map((data) => (
                                    <tr key={data.categoryId}>
                                        <td>{data.categoryId}</td>
                                        <td>{data.categoryName}</td>
                                        <td>{data.systemCreatedDate}</td>

                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline-primary btn-sm"
                                                onClick={() => openEditModal(data)}
                                            >
                                                <i className="fa-solid fa-pen-to-square"></i>
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline-success btn-sm"
                                                onClick={() => openShowModal(data)}
                                            >
                                                <i className="fa-solid fa-expand"></i>
                                            </button>
                                        </td>

                                        <td>
                                            <button
                                                type="button"
                                                className="btn btn-outline-danger btn-sm"
                                                onClick={() => handleDelete(data)}
                                            >
                                                <i className="fa-solid fa-trash-can"></i>
                                            </button>
                                            {/*<Link to={`/blog/category/api/v1/list`}>
                                                <i
                                                    onClick={() => {
                                                        setDeleteBlogCategory(data.categoryId);
                                                    }}
                                                    className="fa-solid fa-trash-can text-danger"
                                                ></i>
                                            </Link>*/}
                                        </td>
                                    </tr>
                                ))}
                                </tbody>
                            </table>
                        )} {/*end pageData.length*/}

                        {/*PAGINATION /PAGE*/}
                        {totalItems > 0 && (
                            <div className="d-flex justify-content-between align-items-center flex-wrap gap-2 mb-4">
                                <div className="small text-muted">
                                    Sayfa {currentPage} / {totalPages}
                                </div>

                                <nav>
                                    <ul className="pagination pagination-sm mb-0">
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button className="page-link" onClick={() => goToPage(1)}>
                                                «
                                            </button>
                                        </li>
                                        <li className={`page-item ${currentPage === 1 ? "disabled" : ""}`}>
                                            <button
                                                className="page-link"
                                                onClick={() => goToPage(currentPage - 1)}
                                            >
                                                ‹
                                            </button>
                                        </li>

                                        {getPageNumbers().map((page) => (
                                            <li
                                                key={page}
                                                className={`page-item ${
                                                    page === currentPage ? "active" : ""
                                                }`}
                                            >
                                                <button
                                                    className="page-link"
                                                    onClick={() => goToPage(page)}
                                                >
                                                    {page}
                                                </button>
                                            </li>
                                        ))}

                                        <li
                                            className={`page-item ${
                                                currentPage === totalPages ? "disabled" : ""
                                            }`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => goToPage(currentPage + 1)}
                                            >
                                                ›
                                            </button>
                                        </li>
                                        <li
                                            className={`page-item ${
                                                currentPage === totalPages ? "disabled" : ""
                                            }`}
                                        >
                                            <button
                                                className="page-link"
                                                onClick={() => goToPage(totalPages)}
                                            >
                                                »
                                            </button>
                                        </li>
                                    </ul>
                                </nav>
                            </div>
                        )}
                    </div>
                )}

            {/*MODAL*/}
            {isModalOpen && (
                <div className="modal fade show d-block"
                role="dialog"
                     style={{backgroundColor:"rgba()0,0,0,0.4"}}
                >
                    <div className="modal-dialog modal-dialog-centered">
                        <div className="modal-content animate__animated animate__zoomIn">
                            <div className="modal-header">
                                <h5 className="modal-title">{getModalTitle()}</h5>
                                <button
                                    type="button"
                                    className="btn-close"
                                    onClick={closeModal}
                                />
                            </div>
                            <div className="modal-body">{renderModalBody()}</div>

                            {modalMode==="show" && (
                                <div className="modal-footer">
                                    <button type="button" className="btn btn-secondary" onClick={closeModal}
                                            >
                                        Kapat
                                    </button>
                                    {selectedCategory &&(
                                        <button
                                            type="button"
                                            className="btn btn-warning"
                                            onClick={() => openEditModal(selectedCategory)}>
                                            <i className="fa-solid fa-binoculars"/>
                                            {t("update")}
                                        </button>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </React.Fragment>
    ); // end return
} // end function

// HOC
export default withTranslation()(BlogCategoryList);

// filtered.slide