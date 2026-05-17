export const AboutPage = () => {
  return (
    <div className="page-container">
      <div className="prose-content">
        <span className="eyebrow">About Us</span>
        <h1>Our Mission</h1>
        <p className="lead">
          We believe that healthcare providers shouldn't have to piece together fragmented data to understand a patient's story.
        </p>
        
        <h2>The Problem</h2>
        <p>
          Modern medicine generates vast amounts of data, but it is often scattered across different systems and formats. This fragmentation makes it difficult for healthcare professionals to see the big picture and understand the chronological progression of a patient's health journey.
        </p>
        
        <h2>Our Solution</h2>
        <p>
          The Clinical Narrative Platform was built to solve this problem. By aggregating and organizing medical events into a cohesive timeline, we empower doctors and nurses to make faster, more informed decisions. Our platform uses advanced algorithms to highlight critical insights and ensure that nothing falls through the cracks.
        </p>
      </div>
    </div>
  );
};
