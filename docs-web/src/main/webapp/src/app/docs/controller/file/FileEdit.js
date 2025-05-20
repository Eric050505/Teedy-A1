'use strict';

/**
 * File edit controller.
 */
angular.module('docs').controller('FileEdit', function($scope, $uibModalInstance, file, Restangular, $timeout, $http) {
  console.log('FileEdit controller initialized with file:', file);
  $scope.file = file;
  let cropper = null;

  // 等待DOM加载完成并初始化裁剪器
  $timeout(function() {
    console.log('Attempting to initialize cropper...');
    const image = document.getElementById('image-to-crop');
    if (image) {
      console.log('Image element found, setting src...');
      // 强制重新加载图片
      image.src = '../api/file/' + $scope.file.id + '/data?_=' + new Date().getTime();
      
      image.onload = function() {
        console.log('Image loaded successfully');
        if (cropper) {
          console.log('Destroying existing cropper instance');
          cropper.destroy();
        }
        
        cropper = new Cropper(image, {
          aspectRatio: NaN,
          viewMode: 2,
          responsive: true,
          restore: false,
          autoCrop: true,
          ready: function() {
            console.log('Cropper initialized and ready');
            // 不需要调用clear和crop方法，因为autoCrop已经设置为true
          }
        });
      };

      // 添加错误处理
      image.onerror = function(e) {
        console.error('Failed to load image:', image.src, e);
      };
    } else {
      console.error('Image element not found!');
    }
  });

  // Rotate image
  $scope.rotate = function(degree) {
    console.log('Rotating image by', degree, 'degrees');
    if (cropper) {
      cropper.rotate(degree);
    } else {
      console.error('Cropper not initialized for rotation');
    }
  };

  // Save edited image
  $scope.save = function() {
    console.log('Save function called');
    if (!cropper) {
      console.error('Cropper not initialized');
      return;
    }

    try {
      console.log('Getting cropped canvas...');
      const canvas = cropper.getCroppedCanvas({
        maxWidth: 4096,
        maxHeight: 4096,
        fillColor: '#fff',
        imageSmoothingEnabled: true,
        imageSmoothingQuality: 'high'
      });
      
      if (!canvas) {
        console.error('Failed to get cropped canvas');
        return;
      }

      console.log('Converting canvas to blob...');
      canvas.toBlob(function(blob) {
        if (!blob) {
          console.error('Failed to create blob from canvas');
          return;
        }
        console.log('Blob created successfully, size:', blob.size);

        const formData = new FormData();
        formData.append('file', blob, $scope.file.name);
        
        console.log('Uploading file with name:', $scope.file.name);
        console.log('File ID:', $scope.file.id);

        // 直接使用 $http 服务进行文件上传
        $http({
          method: 'PUT',
          url: '../api/file',
          headers: {
            'Content-Type': undefined
          },
          data: formData,
          params: {
            id: $scope.file.id
          },
          transformRequest: angular.identity
        }).then(function(response) {
          console.log('Upload successful:', response);
          $uibModalInstance.close();
          // 刷新图片显示
          const img = document.querySelector('img[ng-src="../api/file/' + $scope.file.id + '/data?size=web"]');
          if (img) {
            img.src = '../api/file/' + $scope.file.id + '/data?size=web&_=' + new Date().getTime();
          }
        }).catch(function(error) {
          console.error('Upload failed:', error);
        });

      }, 'image/jpeg', 0.9);
    } catch (error) {
      console.error('Error during save:', error);
      console.error('Error stack:', error.stack);
    }
  };

  // Cancel editing
  $scope.cancel = function() {
    console.log('Cancel editing');
    if (cropper) {
      cropper.destroy();
    }
    $uibModalInstance.dismiss('cancel');
  };

  // Clean up when the modal is closed
  $scope.$on('$destroy', function() {
    console.log('Cleaning up...');
    if (cropper) {
      cropper.destroy();
    }
  });
}); 