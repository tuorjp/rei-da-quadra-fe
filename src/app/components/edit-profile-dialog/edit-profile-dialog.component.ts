import { Component, Inject, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormGroup,
  FormControl,
  Validators,
  ReactiveFormsModule,
  AbstractControl,
  ValidationErrors,
  ValidatorFn
} from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { ImageCropperComponent, ImageCroppedEvent, LoadedImage } from 'ngx-image-cropper';

@Component({
  selector: 'app-edit-profile-dialog',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    ImageCropperComponent
  ],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.css']
})
export class EditProfileDialogComponent {
  form: FormGroup;
  previewPhoto: string | null = null;
  photoChanged = false;

  // Variáveis para controle do crop
  imageChangedEvent: any = '';
  croppedImage: string | null = null;
  isCropping = false;

  // Variáveis para visibilidade da senha
  hidePassword = true;
  hideConfirmPassword = true;

  @ViewChild('fileInput') fileInput!: ElementRef;

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const senha = control.get('senha');
    const confirmarSenha = control.get('confirmarSenha');

    if (!senha || !senha.value) {
      if (confirmarSenha?.hasError('passwordMismatch')) {
        confirmarSenha.setErrors(null);
      }
      return null;
    }

    if (senha.value !== confirmarSenha?.value) {
      confirmarSenha?.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    } else {
      if (confirmarSenha?.hasError('passwordMismatch')) {
        confirmarSenha.setErrors(null);
      }
      return null;
    }
  }

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nome: string, currentPhoto: string | null }
  ) {
    this.previewPhoto = data.currentPhoto;

    this.form = new FormGroup({
      nome: new FormControl(data.nome || '', [Validators.required, Validators.maxLength(30)]),
      senha: new FormControl('', [Validators.minLength(6)]),
      confirmarSenha: new FormControl('')
    }, { validators: this.passwordMatchValidator });
  }

  checkError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.hasError(errorName) : false;
  }

  // --- LÓGICA DE FOTO E CROP ---

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      this.imageChangedEvent = event;
      this.isCropping = true;
    }
  }

  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl || event.base64) {
      this.croppedImage = event.base64 || event.objectUrl || null;
    }
  }

  imageLoaded(image: LoadedImage) { }
  cropperReady() { }

  loadImageFailed() {
    alert('Falha ao carregar imagem.');
    this.cancelCrop();
  }

  confirmCrop(): void {
    if (this.croppedImage) {
      this.previewPhoto = this.croppedImage;
      this.photoChanged = true;
    }
    this.isCropping = false;
    this.imageChangedEvent = '';
  }

  cancelCrop(): void {
    this.isCropping = false;
    this.imageChangedEvent = '';
    this.croppedImage = null;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removePhoto(): void {
    this.previewPhoto = null;
    this.photoChanged = true;
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  // --- AÇÕES DO DIALOG ---

  onCancel(): void {
    this.dialogRef.close();
  }

  onSave(): void {
    if (this.form.valid) {
      const result = {
        ...this.form.value,
        fotoPerfil: this.photoChanged ? (this.previewPhoto || "") : undefined
      };

      this.dialogRef.close(result);
    }
  }
}
