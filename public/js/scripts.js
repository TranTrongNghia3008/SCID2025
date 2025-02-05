(() => {
    'use strict'
  
    // Fetch all the forms we want to apply custom Bootstrap validation styles to
    const forms = document.querySelectorAll('.needs-validation')
  
    // Loop over them and prevent submission
    Array.from(forms).forEach(form => {
      form.addEventListener('submit', event => {
        if (!form.checkValidity()) {
          event.preventDefault()
          event.stopPropagation()
        }
  
        form.classList.add('was-validated')
      }, false)
    })
  })()

document.addEventListener('DOMContentLoaded', function() {
    const dropZone = document.getElementById('drop-zone');
    const fileInput = document.getElementById('file-input');
    const fileList = document.getElementById('file-list');

    // Thêm sự kiện dragover để hiển thị khu vực thả
    dropZone.addEventListener('dragover', function(e) {
        e.preventDefault();
        dropZone.classList.add('dragover');
    });

    // Xóa lớp dragover khi ra khỏi khu vực thả
    dropZone.addEventListener('dragleave', function() {
        dropZone.classList.remove('dragover');
    });

    // Xử lý sự kiện khi người dùng thả file vào khu vực thả
    dropZone.addEventListener('drop', function(e) {
        e.preventDefault();
        dropZone.classList.remove('dragover');
        const files = e.dataTransfer.files;
        handleFiles(files);
    });

    // Ngăn sự kiện click trùng lặp khi nhấp vào input file
    dropZone.addEventListener('click', function(e) {
        if (e.target !== fileInput) {
            fileInput.click();
        }
    });

    // Xử lý sự kiện khi người dùng chọn file bằng file input
    fileInput.addEventListener('change', function(e) {
        const files = e.target.files;
        handleFiles(files);
    });

    // Hàm để xử lý file và hiển thị chúng trong danh sách
    function handleFiles(files) {
        fileList.innerHTML = ''; // Xóa danh sách file trước đó
        for (const file of files) {
            const listItem = document.createElement('div');
            listItem.textContent = `${file.name} (${file.size} bytes)`;
            fileList.appendChild(listItem);
        }
    }
});
