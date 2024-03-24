import React, { useState , useEffect, useRef } from 'react';
import { Resizable } from 're-resizable';
import html2canvas from 'html2canvas';
import { Rnd } from 'react-rnd';

const App = () => {
  //Backend Url
  const backendUrl = process.env.REACT_APP_BACKEND_URL;

 //Resizable Variables
  const [widths, setWidths] = useState(['29%', '68%']);
  const [containerWidth, setContainerWidth] = useState(window.innerWidth - 50);
  const [thirdBlockHeight, setThirdBlockHeight] = useState('50%');

  //Initial load content
  const [recentComponents, setRecentComponents] = useState([]);

  //Add Update Buttons state
  const [selectedAdd , setSelectedAdd] = useState(0);
  const [selectedUpdate , setSelectedUpdate] = useState(0);

  //text 
  const [text , setText] = useState(null);

  //ADD Update API call count state
  const [counts, setCounts] = useState({ addCount: 0, updateCount: 0 });
  const [loading, setLoading] = useState(false);

//Edtior options
  const [showOptions, setShowOptions] = useState(false);
  const [opacity, setOpacity] = useState(1);
  const [bgColor, setBgColor] = useState('#ffffff');
  const [fontColor, setFontColor] = useState('#ffffff');
  const [fontSize, setFontSize] = useState(24);
  const [border , setBorder]= useState('none');
  const divStyle = {
    color: fontColor,
    fontSize: `${fontSize}px`,
    border : border,
    padding : '10px'
};

  //Screenshot Reference
  const ToCaptureRef = useRef();

 // Inital load
  useEffect(() => {
    fetchRecentComponents();
    fetchApiCounts();
  }, []);

  async function fetchApiCounts() {
    try {
      const response = await fetch(`${backendUrl}/counts`);
      if (!response.ok) {
        throw new Error('Failed to fetch counts');
      }
      const data = await response.json();
      setCounts(data);
    } catch (error) {
      console.error('Error fetching API counts:', error);
    }
  };
  const fetchRecentComponents = async () => {
    try {
      const response = await fetch(`${backendUrl}/recentComponents`); 
      if (!response.ok) {
        throw new Error('Failed to fetch recent components');
      }
      const data = await response.json();
      setRecentComponents(data.data); 
    } catch (error) {
      console.error('Error fetching recent components:', error);
    }
  };

  //Resize function horizontally
  const handleResize = (index, event, direction, refToElement) => {
    const newWidths = [...widths];
    console.log(newWidths);
    newWidths[index] = refToElement.offsetWidth;

    const totalWidth = newWidths.reduce((acc, curr) => acc + curr, 0);

    if (totalWidth > containerWidth) {
      const overflow = totalWidth - containerWidth;
      const ratio = overflow / newWidths[index];
      const shrunkWidths = newWidths.map((width, i) => (i !== index ? width - width * ratio : width));
      setWidths(shrunkWidths);
    } else {
      const lessThanDefault = newWidths.findIndex(width => width < 900);
      if (lessThanDefault !== -1) {
        const remainingSpace = containerWidth - totalWidth;
        const additionalWidthPerComponent = remainingSpace / (widths.length - 1);
        const expandedWidths = newWidths.map((width, i) =>
          i !== index ? width + additionalWidthPerComponent : width
        );
        setWidths(expandedWidths);
      } else {
        setWidths(newWidths);
      }
    }
  };
   
  //Add and Update API call function 
  const handleFileUpload = async (file) => {
    try {

      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('text', text);
      formData.append('component' , selectedAdd);


      const response = await fetch(`${backendUrl}/upload`, {
        method: 'POST',
        body: formData,
      });
  
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
     
      fetchRecentComponents();
      window.location.reload();
      setSelectedAdd(0);
      setLoading(false);

    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };
  const handleFileUpdate = async (file) => {
    try {

      setLoading(true);
      const formData = new FormData();
      formData.append('image', file);
      formData.append('text', text);
      formData.append('component' , selectedUpdate);


      const response = await fetch(`${backendUrl}/update/${recentComponents[selectedUpdate-1]._id}`, {
  method: 'PUT', // Use PUT method for update
  body: formData,
});

  
      if (!response.ok) {
        throw new Error('Failed to upload image');
      }
     
      fetchRecentComponents();
      window.location.reload();
      setSelectedUpdate(0);
      setLoading(false);

    } catch (error) {
      console.error('Error uploading image:', error);
    }
  };

 // Drag Drop or select 
  const handleFileChange = (event) => {
    const file = event.target.files[0];
    if (file && selectedAdd === 1) {
      handleFileUpload(file);
    }
  };
  const handleFilechangeUpdate = (event) => {
    const file = event.target.files[0];
    if (file && selectedAdd === 1) {
      handleFileUpdate(file);
    }
  }
  const handleDrop = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file ){
      handleFileUpload(file);
    }
  };
  const handleDropUpdate = (event) => {
    event.preventDefault();
    const file = event.dataTransfer.files[0];
    if (file ){
      handleFileUpdate(file);
    }
  }
  const handleKeyPress = (e) => {
    if (e.key === 'Enter') {
      if (selectedAdd === 2) {
        handleFileUpload(null);
      }
    }
  };
  const handleKeyPressUp = (e) => {
    if (e.key === 'Enter') {
      if (selectedUpdate === 2) {
        handleFileUpdate(null);
      }
    }
  };
  

 //Edtior and Screenshot extra functionallity 
  function Editor(){
    setShowOptions(!showOptions);
  };
  function captureScreenshot() {
       let canvasPromise = html2canvas(ToCaptureRef.current, {
            useCORS: true
        });
  
        canvasPromise.then((canvas) => {
             let dataURL = canvas.toDataURL("image/png"); 
             let fileName = "screenshot.png";
             let img = new Image();
             img.src = dataURL;
             let a = document.createElement("a");
             a.innerHTML = "DOWNLOAD";
             a.target = "_blank";
             a.href = dataURL;
         
             a.download = fileName;
             a.click();
        });
  }


  return (
    <div className="flex flex-col h-screen">
      <div className="flex flex-1">
         {/* First two Resizable Components placed Horizontally */}
        {widths.map((width, index) => (
         <Resizable
         key={index}
         size={{ width: width, height: '90%' }}
         minWidth={'25%'}
         maxWidth={'72%'}
         style={{ background: index === 0 ? '#F4F4F4' : '#F0F0F0', padding: '10px', margin: '10px', border: '2px solid #E5E5E5' }}
         onResize={(e, direction, refToElement) => handleResize(index, e, direction, refToElement)}
         bounds='parent'
       >
         {index === 0 && recentComponents.length > 0 && (
           <div className="flex flex-col justify-between h-full">
             <div className="flex-1">
               <div className="h-3/4 bg-yellow-300 m-2 text-left" style={{ background: `url(${recentComponents[0].image})`, backgroundSize: 'cover',  backgroundColor: selectedAdd === 1 ? '#FFFF00' : 'transparent',  backgroundRepeat: 'no-repeat', backgroundPosition: 'center' }}>
                     {selectedAdd === 1 ?  <div className='text-wrap bg-gray-100 p-4  shadow-md w-full h-full flex flex-col justify-center items-center' onDrop={handleDrop} onDragOver={(e) => e.preventDefault()} ><div>Drag and Drop New Image <input type="file" onChange={handleFileChange} /> {loading ?  <div>wait... </div> : <div></div>}</div></div> : <div></div> }
                     {selectedUpdate === 1 ?  <div className='text-wrap bg-gray-100 p-4  shadow-md w-full bg-transparent h-full flex flex-col justify-center items-center' onDrop={handleDropUpdate} onDragOver={(e) => e.preventDefault()} ><div>Update Image <input type="file" onChange={handleFilechangeUpdate} /> {loading ?  <div>wait... </div> : <div></div>}</div></div> : <div></div> }
              </div>
             </div>
             <div className="flex justify-between">
               <button className="bg-red-500 px-4 py-2 rounded text-white" onClick={()=>{setSelectedAdd(1) ; setSelectedUpdate(0)}}>Add</button>
               <div className='flex flex-col'>
                   <div className='font-semibold text-sm'>Created At : {recentComponents[0].createdAt}</div>
                   <div className='font-semibold text-sm'>Updated At : {recentComponents[0].updatedAt}</div>
               </div>
               <button className="bg-blue-500 px-4 py-2 rounded text-white"  onClick={()=>{setSelectedUpdate(1); setSelectedAdd(0)}}>Update</button>
             </div>
           </div>
         )}
        
         {index !== 0 && recentComponents.length > 0 && (
          <div className="flex flex-col justify-between h-full">
          <div className="flex-1 h-3/4 bg-gradient-to-r from-red-400 to-gray-400 m-2 text-white text-lg font-bold flex items-center justify-center">
                 {selectedAdd === 2 ? <textarea className="w-full h-full p-4 text-lg text-black" placeholder="Type here..." onChange={(e)=>{setText(e.target.value)}} onKeyDown={handleKeyPress}></textarea>  
                 :  
                   <div className='w-full h-full'>
                      {selectedUpdate === 2 ? (
                       <textarea 
                             className="w-full h-full p-4 text-lg text-black" 
                             placeholder="Type here..." 
                             defaultValue={recentComponents[1].text}
                             onChange={(e) => setText(e.target.value)}
                              onKeyDown={handleKeyPressUp}
                       ></textarea>
                       ) : (
                        <div className='m-2'>{recentComponents[1].text}</div>
                       )}
                   </div> 
                  }
          </div>
          <div className="flex justify-between">
            <button className="bg-red-500 px-4 py-2 rounded text-white" onClick={()=>{setSelectedAdd(2) ; setSelectedUpdate(0)}}>Add</button>
            <div className='flex flex-col'>
                   <div className='font-semibold text-sm'>Created At : {recentComponents[1].createdAt}</div>
                   <div className='font-semibold text-sm'>Updated At : {recentComponents[1].updatedAt}</div>
               </div>
            <button className="bg-blue-500 px-4 py-2 rounded text-white" onClick={()=>{setSelectedUpdate(2); setSelectedAdd(0)}}>Update</button>
          </div>
        </div>
        
         )}
       </Resizable>
       
        ))}
      </div>
       {/* Third Resizable Components placed Vertically */}
      <Resizable
        size={{ height: thirdBlockHeight }}
        minWidth={'15%'}
        maxWidth={'100%'}
        minHeight={'30%'}
        maxHeight={'100%'}
        style={{ background: '#F0F0F0', padding: '10px', margin: '10px', border: '2px solid #E5E5E5' }}
        onResize={(e, direction, refToElement) => setThirdBlockHeight(refToElement.style.height)}
      >
       <div className="flex flex-col justify-between h-full">
  <div className="flex-1">
    {
      recentComponents.length > 0 &&  
      <div id='divToCapture' ref={ToCaptureRef} className="h-full bg-gray-300 m-1 relative">
        <div id="img-div" className="absolute inset-0 bg-cover  bg-center opacity-75" style={{ backgroundImage: `url(${recentComponents[0].image})` , opacity: opacity, backgroundColor: bgColor }}></div>
         {/* Text Resizable and draggable */}
        <Rnd
          default={{
            x: 0,
            y: 0,
            width: 320,
            height: 200,
          }}
          bounds="parent"
         >
              <div id='text-div' style={divStyle} className="absolute inset-0 flex items-center justify-center text-white text-2xl font-bold">
                  <div> {recentComponents[1].text}</div> 
              </div>
        </Rnd>
      </div>
    }
  </div>
</div>

      </Resizable>  

       {/* Bottom Bar  */}
      <div className='relative flex flex-row text-sm text-white justify-between'>
    <div className='bg-blue-500 h-8 p-2'>Add API calls: {counts.addCount}</div>
    <div className='bg-green-500 h-8 p-2'>Update API calls: {counts.updateCount}</div>
    <div className='bg-purple-500 h-8 p-2 flex items-center'>Your ID: {recentComponents.length > 0 ? <span>{recentComponents[1]._id}</span> : <span></span>}</div>
     {/* Edtior and Controls */}
    <div className='bg-yellow-500 flex h-8 p-2' onClick={Editor}>Editor <img className='w-5 h-5 ml-2' src='arrow-up.png' alt='aa' /></div>
    {showOptions && (
                <div className='absolute  text-white  w-48 right-48 -mt-80 bg-gray-800 p-2'>
                    <div className="mb-2">
                        <label htmlFor='opacity' className="block mb-1">Opacity:</label>
                        <input type='range' id='opacity' className='w-full' name='opacity' min='0' max='1' step='0.1'  defaultValue={opacity} onChange={(e)=>{setOpacity(e.target.value)}} />
                    </div>
                    <div className="mb-2">
                        <label htmlFor='bgColor' className="block mb-1">Background Color:</label>
                        <input type='color' id='bgColor' name='bgColor'  defaultValue={bgColor} onChange={(e)=>{setBgColor(e.target.value)}}/>
                    </div>
                    <div className="mb-2">
                        <label htmlFor='fontColor' className="block mb-1">Font Color:</label>
                        <input type='color' id='fontColor' name='fontColor'  defaultValue={fontColor} onChange={(e)=>{setFontColor(e.target.value)}}/>
                    </div>
                    <div className="mb-2">
                        <label htmlFor='fontSize' className="block mb-1">Font Size:</label>
                        <input type='number' id='fontSize' name='fontSize' className='text-black' min='8' max='48' defaultValue={fontSize} onChange={(e)=>{setFontSize(e.target.value)}} />
                    </div>
                    <div className="mb-2">
                        <label htmlFor='fontSize' className="block mb-1">Toggle Border:</label>
                        <input type='checkbox' id='fontSize' name='fontSize' className='text-black' min='8' max='48' defaultValue={fontSize} onChange={(e)=>{ e.target.checked ? setBorder('2px solid white') : setBorder('none')}} />
                    </div>
                </div>
            )}
     {/* ScreenShot Button*/}
    <button onClick={captureScreenshot} className='flex items-center justify-center bg-red-500 w-28 h-8 p-2'><img src='capture.png' alt='cap' className='w-4 h-4 mr-1'/>Screenshot</button>
</div>


    </div>
  );
};

export default App;

