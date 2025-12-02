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
    ImageCropperComponent
  ],
  templateUrl: './edit-profile-dialog.component.html',
  styleUrls: ['./edit-profile-dialog.component.css']
})
export class EditProfileDialogComponent {
  form: FormGroup;
  previewPhoto: string | null = null;
  photoChanged = false;

  //Variáveis para controle do crop
  imageChangedEvent: any = '';
  croppedImage: string | null = null;
  isCropping = false;

  @ViewChild('fileInput') fileInput!: ElementRef;

  passwordMatchValidator: ValidatorFn = (control: AbstractControl): ValidationErrors | null => {
    const senha = control.get('senha')?.value;
    const confirmarSenha = control.get('confirmarSenha')?.value;
    if (!senha || !confirmarSenha) return null;
    return senha === confirmarSenha ? null : { passwordMismatch: true };
  }

  constructor(
    public dialogRef: MatDialogRef<EditProfileDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { nome: string, currentPhoto: string | null }
  ) {
    this.previewPhoto = data.currentPhoto;

    this.form = new FormGroup({
      nome: new FormControl(data.nome || '', [Validators.required]),
      senha: new FormControl('', [Validators.minLength(6)]),
      confirmarSenha: new FormControl('')
    }, { validators: this.passwordMatchValidator });
  }

  checkError(controlName: string, errorName: string): boolean {
    const control = this.form.get(controlName);
    return control ? control.hasError(errorName) : false;
  }

  //LÓGICA DE FOTO E CROP

  onFileSelected(event: any): void {
    if (event.target.files && event.target.files.length > 0) {
      // Ativa o modo de corte e passa o evento para o cropper
      this.imageChangedEvent = event;
      this.isCropping = true;
    }
  }

  // Chamado automaticamente pelo componente image-cropper a cada movimento
  imageCropped(event: ImageCroppedEvent) {
    if (event.objectUrl || event.base64) {
      // Salva o resultado temporário
      this.croppedImage = event.base64 || event.objectUrl || null;
    }
  }

  imageLoaded(image: LoadedImage) {
    // Imagem carregada no cropper
  }

  cropperReady() {
    // Cropper pronto para uso
  }

  loadImageFailed() {
    alert('Falha ao carregar imagem.');
    this.cancelCrop();
  }

  confirmCrop(): void {
    if (this.croppedImage) {
      // Aplica a imagem cortada ao preview principal
      this.previewPhoto = this.croppedImage;
      this.photoChanged = true;
    }
    // Sai do modo de corte e limpa evento para permitir re-seleção se necessário
    this.isCropping = false;
    this.imageChangedEvent = '';
  }

  cancelCrop(): void {
    this.isCropping = false;
    this.imageChangedEvent = '';
    this.croppedImage = null;
    // Reseta o input file para permitir selecionar o mesmo arquivo novamente se quiser
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  removePhoto(): void {
    this.previewPhoto = null;
    this.photoChanged = true;
    // Garante que o input file seja limpo
    if (this.fileInput) {
      this.fileInput.nativeElement.value = '';
    }
  }

  //AÇÕES DO DIALOG

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
