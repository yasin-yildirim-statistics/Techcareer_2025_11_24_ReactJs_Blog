// REACT
import React, {useEffect, useState, useMemo} from 'react';

// ROUTER
import {Link, useNavigate} from 'react-router-dom';

// API LIST CALL
import BlogCategoryApiService from '../../services/BlogCategoryApiService';

// I18N
import {withTranslation} from 'react-i18next';

// IMPORT
import Swal from "sweetalert2"
import toast from "react-hot-toast"
import {start} from "@popperjs/core";

// FUNCTION
function BlogCategoryList({props, t, i18n}) {
    // FIELD

    // ROUTER
    let navigate = useNavigate();

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
            const nameStr = String(cat.categoryName ?? "").toLowerCase();
            const dateStr = String(cat.systemCreatedDate ?? "").toLowerCase();

            return(
                idStr.includes(normalized) ||
                nameStr.includes(normalized) ||
                dateStr.includes(normalized)
            )
        })

        // Pagination
        const total = filtered.length || 0;
        const pages = total === 0 ? 1 : Math.ceil(total / pageSize);
        const safeCurrentPage = Math.min(Math.max(1, currentPage), pages);
       const startIndex = (safeCurrentPage-1)*pageSize;
       const paged = filtered.slide(startIndex, startIndex+pageSize);

       return{
           pageData:paged,
           totalItems:total,
           totalPages:pages
       }
    },[blogCategoryApiListData,searchTerm,pageSize,currentPage]);

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
    const openCreateModal = ()=>{
        setModalMode("create");
        setSelectedCategory(null);
        setFormData({
            categoryName: "",
        })
        setIsModalOpen(true);
    }

    // SHOW MODAL ACTIVE
    const openShowModal = (category)=>{
        setModalMode("show");
        setSelectedCategory(category);
        setIsModalOpen(true)
    }

    // EDIT MODAL ACTIVE
    const openEditModal = (category)=>{
        setModalMode("edit");
        setSelectedCategory(category);
        setFormData({
            categoryName: category.categoryName || "",
        })
        setIsModalOpen(true)
    }

    // CLOSE MODAL ACTIVE
    const closeModal = ()=>{
        setIsModalOpen(false);
        setSelectedCategory(null);
        setFormData({
            categoryName: "",
        })
        setModalMode("show")
    }


    // =======================================================================
    // FORM HANDLE FUNCTIONS
    // =======================================================================

    // =======================================================================
    // listManipulationAfter
    // =======================================================================
    // After, delete, update, create (data giving)
    // LIST
    const listManipulationAfter = () => {
        BlogCategoryApiService.objectApiList()
            .then((response) => {
                if (response.status === 200) {
                    // CONSOLE
                    console.log(response);
                    console.log(response.data);
                    console.log(response.status);
                    console.log(response.headers);

                    // USESTATE
                    setBlogCategoryApiListData(response.data);
                }
            })
            .catch((error) => {
                console.error('Blog Category listManipulationAfter: ', error);
            });
    }; // end listManipulationAfter

    // UPDATE LOCAL-STORAGE(ID)
    const setUpdateBlogCategory = (data) => {
        let {id, categoryName} = data;
        localStorage.setItem('blog_category_update_id', id);
        localStorage.setItem('blog_category_category_name', categoryName);
    };

    // UPDATE LOCAL-STORAGE(ID)
    const setViewBlogCategory = (data) => {
        let {id} = data;
        localStorage.setItem('blog_category_view_id', id);
    };

    // DELETE
    const setDeleteBlogCategory = (id) => {
        if (window.confirm(id + ' nolu datayı silmek istiyor musunuz ?')) {
            BlogCategoryApiService.objectApiDelete(id)
                .then((response) => {
                    if (response.status === 200) {
                        listManipulationAfter();
                        navigate('blog/category/list');
                    }
                })
                .catch((error) => {
                    console.error('Blog Category Delete: ', error);
                    window.location = 'blog/category/list';
                });
        } else {
            alert(`${id} nolu data silinmedi. `);
            window.location = 'blog/category/list';
        }
    }; // end setDeleteBlogCategory

    // RETURN
    return (
        <React.Fragment>
            <br/>
            <br/>
            <br/>
            <br/>
            <br/>
            <h1 class="text-center display-5 mt-3 mb-5">{t('blog_category_list')}</h1>
            <Link className="btn btn-primary ms-2 me-4" to="/blog/category/api/v1/create">
                {t('create')}
            </Link>

            <div className="table-responsive">
                <table className="table table-primary table-striped table-responsive mb-4">
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
                    {blogCategoryApiListData.map((data) => (
                        <tr key={data.categoryId}>
                            <td>{data.categoryId}</td>
                            <td>{data.categoryName}</td>
                            <td>{data.systemCreatedDate}</td>

                            <td>
                                <Link to={`/blog/category/api/v1/update/${data.categoryId}`}>
                                    <i
                                        onClick={() => {
                                            setUpdateBlogCategory(data);
                                        }}
                                        className="fa-solid fa-wrench text-primary"
                                    ></i>
                                </Link>
                            </td>

                            <td>
                                <Link to={`/blog/category/api/v1/find/${data.categoryId}`}>
                                    <i
                                        onClick={() => {
                                            setViewBlogCategory(data.categoryId);
                                        }}
                                        className="fa-solid fa-eye text-success"
                                    ></i>
                                </Link>
                            </td>

                            <td>
                                <Link to={`/blog/category/api/v1/list`}>
                                    <i
                                        onClick={() => {
                                            setDeleteBlogCategory(data.categoryId);
                                        }}
                                        class="fa-solid fa-trash-can text-danger"
                                    ></i>
                                </Link>
                            </td>
                        </tr>
                    ))}
                    </tbody>
                </table>
            </div>
        </React.Fragment>
    ); // end return
} // end function

// HOC
export default withTranslation()(BlogCategoryList);
