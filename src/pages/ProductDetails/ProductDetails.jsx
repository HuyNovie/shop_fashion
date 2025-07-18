import React, { useCallback, useEffect, useMemo } from 'react'
import { Link, useLoaderData} from 'react-router-dom';
import {useState} from 'react';
import Breadcrumb from '../../components/Breadcrumb/Breadcrumb';
import content from '../../data/content.json';
import Rating from '../../components/Rating/Rating';
import SizeFilter from '../../components/Filters/SizeFilter';
import ProductColor from './ProductColor';
import SvgCreditCard from '../../components/commom/SvgCreditCard';
import SvgCloth from '../../components/commom/SvgCloth';
import SvgShipping from '../../components/commom/SvgShipping';
import SvgReturn from '../../components/commom/SvgReturn';
import SeactionHeading from '../../components/Sections/SeactionHeading';
import ProductCard from '../../pages/ProductListPage/ProductCard';
import { useSelector, useDispatch } from 'react-redux';
import { getAllProducts } from '../../api/fetchProducts.jsx';
import _, { values } from 'lodash';
import { addItemToCartAction } from '../../store/actions/cartAction.js';

const extraSections = [
  {
    icon:<SvgCreditCard />,
    label:'Secure payment'
  },
  {
    icon:<SvgCloth />,
    label:'Size & Fit'
  },
  {
    icon:<SvgShipping />,
    label:'Free shipping'
  },
  {
    icon:<SvgReturn />,
    label:'Free Shipping & Returns'
  }
]

const ProductDetails = () => {
  const {product} = useLoaderData();
  const [image, setImage] = useState();
  const [breadcrumbLinks, setBreadCrumbLink] = useState(); 
  const dispatch = useDispatch();
  const cartItems = useSelector((state) => state.cartState?.cart);
  const [similarProduct,setSimilarProducts] = useState([]);
  const categories = useSelector((state)=> state?.categoryState?.categories);
  const [selecteSize,setSelectedSize] = useState('');
  const [error,setError] = useState('');

  // Add error handling for when product is undefined
  if (!product) {
    return (
      <div className="flex justify-center items-center h-screen">
        <p className="text-xl">Product not found!</p>
      </div>
    );
  }

  useEffect(()=>{
    getAllProducts(product?.categoryId,product?.categoryTypeId).then(res=>{
      const excludedProduct = res?.filter((item)=> item?.id !== product?.id);
      setSimilarProducts(excludedProduct);
    }).catch((error) => {
      console.error('Error fetching similar products:', error);
      setSimilarProducts([]);
    });
  },[product?.categoryId, product?.categoryTypeId, product?.id]);

  const productCategory = useMemo(() => {
    // For API data, use categoryId and categoryName
    if (product?.categoryId && product?.categoryName) {
      return { id: product.categoryId, name: product.categoryName };
    }
    // For local data, find category from categories array
    return categories?.find((category) => category?.id === product?.categoryId);
  }, [product, categories]);

  useEffect(() => {
    // Set initial image from productResources or thumbnail
    if (product?.productResources && product.productResources.length > 0) {
      setImage(product.productResources[0]?.url);
    } else {
      setImage(product?.thumbnail);
    }
    
    // Breadcrumb: Home > Category > Product Name
    setBreadCrumbLink([
      { title: 'Home', path: '/' },
      productCategory ? { title: productCategory.name, path: `/products` } : null,
      { title: product?.name || product?.title }
    ].filter(Boolean));
  }, [productCategory, product]);

  const addItemToCart = useCallback(() => {

    if(!selecteSize){
      setError('Please select size')
    }
    else{
      const selectedVariant = product?.variants.filter((variant) => variant?.size === selecteSize)?.[0];
      console.log('ProductDetails - product:', product);
      console.log('ProductDetails - product.price:', product?.price);
      console.log('ProductDetails - selectedVariant:', selectedVariant);
      
      if(selectedVariant?.stockQuantity>0){
        const cartItem = {
          productId:product?.id,
          thumbnail:product?.thumbnail,
          name:product?.name,
          variant:selectedVariant,
          quantity:1,
          price:product?.price,
          // subTotal sẽ được tính tự động trong reducer
        };
        console.log('ProductDetails - cartItem to dispatch:', cartItem);
        dispatch(addItemToCartAction(cartItem))
      }else{
        setError('Out of Stock');
      }
    }

  },[dispatch, product, selecteSize]);

  useEffect(()=>{
    if(selecteSize){
      setError('');
    }
  },[selecteSize]);

  const colors = useMemo(()=>{
    const colorSet = _.uniq(_.map(product?.variants,'color'));
    return colorSet

  },[product]);

  const sizes = useMemo(()=>{
    const sizeSet = _.uniq(_.map(product?.variants,'size'));
    return sizeSet

  },[product]);

  return (
    <>
      <div className='flex flex-col md:flex-row px-10 pt-20 '>
        <div className='w-[100%] lg:w-[50%] md:w-[40%]' >
          {/*Images*/}
          <div className='flex flex-col md:flex-row '>
            <div className='w-[100%] md:w-[20%] justify-center h-[40px] md:h-[420px]'>
              {/*Stack of images*/}
              <div className='flex flex-row md:flex-col justify-center h-full'>
                {
                  product?.productResources && product.productResources.length > 0 ? (
                    product.productResources.map((item, index) => (
                      <button key={index} onClick={() => setImage(item?.url)} 
                      className='rounded-lg w-fit p-2 mb-2'>
                        <img src={item?.url} 
                        className='h-[60px] w-[60px] rounded-lg bg-cover bg-center hover:scale-105 hover:border' 
                        alt={'sample-' + index} />
                      </button>
                    ))
                  ) : (
                    // Fallback to thumbnail if no productResources
                    <button onClick={() => setImage(product?.thumbnail)} 
                    className='rounded-lg w-fit p-2 mb-2'>
                      <img src={product?.thumbnail} 
                      className='h-[60px] w-[60px] rounded-lg bg-cover bg-center hover:scale-105 hover:border' 
                      alt="product-thumbnail" />
                    </button>
                  )
                }
              </div>
            </div>
            <div className='w-full md:w-[80%] flex justify-center md:pt-0 pt-10'>
              <img src={image} alt={product?.name || product?.title} className='h-full w-full max-h-[520px]
         border rounded-lg cursor-pointer object-cover'/>
            </div>
          </div>
        </div>
        <div className='w-[60%] px-10' >
          {/*Product Information*/}
          <Breadcrumb links={breadcrumbLinks} />
          <p className='text-3xl pt-4'>{product?.name || product?.title}</p>
          <Rating rating={product?.rating} />
          {/* Price Tag */}
          <p className='text-xl bold py-2'>${product?.price}</p>
          <div className='flex flex-col'>
            <div className='flex gap-2'>
              <p className='text-sm bold'>Select Size</p>
              <Link className='text-sm text-gray-500 hover:text-gray-900' to={'https://en.wikipedia.org/wiki/Clothing_sizes'} target='_blank'>{'Size Guide ->'}</Link>
            </div>
          </div>
          <div >
            <SizeFilter onChange={(values)=>setSelectedSize(values?.[0])} sizes={sizes} hidleTitle multi={false} />
          </div>
          <div>
            <p className='text-sm bold mb-2'>Select Color</p>
            <ProductColor colors={product?.variants?.map(v => v.color) || product?.color || []} />
          </div>
           <div className='flex py-4'>
         <button onClick={addItemToCart} className='bg-black rounded-lg hover:bg-gray-700'><div className='flex h-[42px] rounded-lg w-[150px] px-2 items-center justify-center bg-black text-white hover:bg-gray-700'><svg width="17" height="16" className='' viewBox="0 0 17 16" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M1.5 1.33325H2.00526C2.85578 1.33325 3.56986 1.97367 3.6621 2.81917L4.3379 9.014C4.43014 9.8595 5.14422 10.4999 5.99474 10.4999H13.205C13.9669 10.4999 14.6317 9.98332 14.82 9.2451L15.9699 4.73584C16.2387 3.68204 15.4425 2.65733 14.355 2.65733H4.5M4.52063 13.5207H5.14563M4.52063 14.1457H5.14563M13.6873 13.5207H14.3123M13.6873 14.1457H14.3123M5.66667 13.8333C5.66667 14.2935 5.29357 14.6666 4.83333 14.6666C4.3731 14.6666 4 14.2935 4 13.8333C4 13.373 4.3731 12.9999 4.83333 12.9999C5.29357 12.9999 5.66667 13.373 5.66667 13.8333ZM14.8333 13.8333C14.8333 14.2935 14.4602 14.6666 14 14.6666C13.5398 14.6666 13.1667 14.2935 13.1667 13.8333C13.1667 13.373 13.5398 12.9999 14 12.9999C14.4602 12.9999 14.8333 13.373 14.8333 13.8333Z" stroke="white" strokeWidth="1.5" strokeLinecap="round" />
          </svg>Add to cart</div></button>
        </div>
        {error && <p className='text-lg text-red-600'>{error}</p>}
        <div className='grid md:grid-cols-2 gap-4 pt-4'>
          {/*  */}
          {
            extraSections?.map((section,index)=>(
              <div key={index} className='flex items-center'>
                {section?.icon}
                <p className='px-2'>{section?.label}</p>
              </div>
            ))
          }  
          </div>  



        </div>

    
      </div>
       {/* Product Description */}
          <SeactionHeading title={'Product Description'} />
           <div className='md:w-[50%] w-full p-2'>
              <p className='px-8'>{product?.description}</p>
            </div>

             <SeactionHeading title={'Similar Products'}/>
            <div className='flex px-10'></div>

             <div className='pt-4 grid grid-cols-1 lg:grid-cols-5 md:grid-cols-3 gap-8 px-2 pb-10'>
                {similarProduct?.map((item,index)=>(
                  <ProductCard key={item.id || index} {...item}/>
                ))}
                {!similarProduct?.length && <p>No Products Found!</p>}

    </div>
    </>
  )
}

export default ProductDetails