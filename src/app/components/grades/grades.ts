import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { AcademicService, Student, Grade } from '../../services/academic.service';
// import { AuthService } from '../../services/auth.service'; // Descomenta si usas tu auth guard

@Component({
  selector: 'app-grades',
  standalone: true,
  imports: [CommonModule, FormsModule],
  template: ``,
})
export class GradesComponent implements OnInit {
  private academicService = inject(AcademicService);

  // Variables de la UI
  levels: string[] = [];
  selectedLevel: string = '';

  students: Student[] = [];
  selectedStudent: Student | null = null;

  // Plantilla base de habilidades a evaluar
  studentGrades: Grade[] = [];

  // Variables de estado
  isSaving: boolean = false;

  ngOnInit() {
    if (this.isAdminOrTeacher()) {
      // Cargamos los niveles fijos (o desde Firestore si lo cambiaste)
      this.levels = this.academicService.getLevels();
    }
  }

  isAdminOrTeacher(): boolean {
    // Aquí validas con tu AuthService si es Admin o Teacher
    return true;
  }

  onLevelChange() {
    this.selectedStudent = null;
    this.studentGrades = [];

    if (this.selectedLevel) {
      // Escuchamos los estudiantes desde Firestore en tiempo real
      this.academicService.getStudentsByLevel(this.selectedLevel).subscribe({
        next: (res) => {
          this.students = res;
        },
        error: (err) => console.error('Error fetching students:', err),
      });
    }
  }

  onStudentChange() {
    if (this.selectedStudent) {
      // Si el estudiante ya tiene notas en Firestore, las cargamos.
      // Si no, inicializamos las habilidades en cero/vacío.
      if (this.selectedStudent.grades && this.selectedStudent.grades.length > 0) {
        this.studentGrades = [...this.selectedStudent.grades];
      } else {
        this.studentGrades = [
          { skill: 'Reading', score: null, observation: '' },
          { skill: 'Writing', score: null, observation: '' },
          { skill: 'Listening', score: null, observation: '' },
          { skill: 'Speaking', score: null, observation: '' },
          { skill: 'Grammar', score: null, observation: '' },
        ];
      }
    }
  }

  async saveGrades() {
    if (this.selectedStudent && this.selectedStudent.id) {
      try {
        this.isSaving = true;
        // Llamada a Firestore
        await this.academicService.saveGrades(this.selectedStudent.id, this.studentGrades);
        alert('Notas guardadas exitosamente en la base de datos.');
      } catch (error) {
        console.error('Error guardando notas:', error);
        alert('Hubo un error al guardar las notas.');
      } finally {
        this.isSaving = false;
      }
    }
  }
}
