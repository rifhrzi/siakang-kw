export class Student {
  constructor({
    name,
    nim,
    program,
    faculty,
    batch,
    status,
    advisor,
    photoUrl,
    semesterStatus,
  }) {
    this.name = name;
    this.nim = nim;
    this.program = program;
    this.faculty = faculty;
    this.batch = batch;
    this.status = status;
    this.advisor = advisor;
    this.photoUrl = photoUrl;
    this.semesterStatus = semesterStatus;
  }

  get programLabel() {
    return `${this.program} · ${this.faculty}`;
  }

  get identitySummary() {
    return [
      { label: 'NIM', value: this.nim },
      { label: 'Angkatan', value: this.batch },
      { label: 'Status', value: this.status },
      { label: 'Dosen PA', value: this.advisor },
    ];
  }
}
